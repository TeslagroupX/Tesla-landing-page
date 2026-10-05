import {
  Headers,
  MAX_BODY_BYTES,
  MAX_CONCURRENT,
  clientIp,
  forwardHeaders,
  rejection,
} from './contact-guards';

const BROWSER: Headers = {
  host: 'teslagroup.pe',
  'content-type': 'multipart/form-data; boundary=----x',
  'content-length': '2048',
  'sec-fetch-site': 'same-origin',
  origin: 'https://teslagroup.pe',
};

describe('rejection', () => {
  it('should let a form sent from the site itself through', () => {
    expect(rejection(BROWSER, 0)).toBeNull();
  });

  it('should refuse anything that is not a multipart form', () => {
    expect(rejection({ ...BROWSER, 'content-type': 'application/json' }, 0)?.status).toBe(415);
    expect(rejection({ ...BROWSER, 'content-type': undefined }, 0)?.status).toBe(415);
  });

  it('should refuse a form sent from another site', () => {
    expect(rejection({ ...BROWSER, 'sec-fetch-site': 'cross-site' }, 0)?.status).toBe(403);
    expect(rejection({ ...BROWSER, 'sec-fetch-site': 'same-site' }, 0)?.status).toBe(403);
  });

  it('should compare the origin with the host when the browser does not say the site', () => {
    const old = { ...BROWSER, 'sec-fetch-site': undefined };
    expect(rejection(old, 0)).toBeNull();
    expect(rejection({ ...old, origin: 'https://otro.example' }, 0)?.status).toBe(403);
    expect(rejection({ ...old, origin: 'null' }, 0)?.status).toBe(403);
  });

  it('should not ask a client that is not a browser where it comes from', () => {
    expect(rejection({ ...BROWSER, 'sec-fetch-site': undefined, origin: undefined }, 0)).toBeNull();
  });

  it('should refuse a body that does not declare its size', () => {
    expect(rejection({ ...BROWSER, 'content-length': undefined }, 0)?.status).toBe(411);
    expect(rejection({ ...BROWSER, 'content-length': '-1' }, 0)?.status).toBe(411);
  });

  it('should refuse a body over the limit without reading it', () => {
    expect(rejection({ ...BROWSER, 'content-length': String(MAX_BODY_BYTES) }, 0)).toBeNull();
    expect(rejection({ ...BROWSER, 'content-length': String(MAX_BODY_BYTES + 1) }, 0)?.status).toBe(
      413,
    );
  });

  it('should ask to retry when too many are being sent at once', () => {
    const busy = rejection(BROWSER, MAX_CONCURRENT);
    expect(busy?.status).toBe(503);
    expect(busy?.retryAfter).toBe(5);
    expect(rejection(BROWSER, MAX_CONCURRENT - 1)).toBeNull();
  });
});

describe('clientIp', () => {
  it('should take the address Cloudflare writes', () => {
    expect(clientIp({ 'cf-connecting-ip': '203.0.113.7' }, '172.18.0.4')).toBe('203.0.113.7');
    expect(clientIp({ 'cf-connecting-ip': '2001:db8::1' }, '172.18.0.4')).toBe('2001:db8::1');
  });

  it('should fall back to the socket, without the IPv4-in-IPv6 prefix', () => {
    expect(clientIp({}, '::ffff:127.0.0.1')).toBe('127.0.0.1');
  });

  it('should not pass along something that is not an address', () => {
    expect(clientIp({ 'cf-connecting-ip': '1.2.3.4, evil' }, '10.0.0.2')).toBe('10.0.0.2');
    expect(clientIp({}, undefined)).toBe('');
  });
});

describe('forwardHeaders', () => {
  it('should forward only what the backend needs, with the address of the visitor', () => {
    const forwarded = forwardHeaders(
      {
        ...BROWSER,
        'user-agent': 'Mozilla/5.0',
        cookie: 'refresh=abc',
        authorization: 'Bearer abc',
        'x-forwarded-for': '6.6.6.6',
      },
      '203.0.113.7',
    );

    expect(forwarded).toEqual({
      'content-type': 'multipart/form-data; boundary=----x',
      'content-length': '2048',
      accept: 'application/json',
      'user-agent': 'Mozilla/5.0',
      'cf-connecting-ip': '203.0.113.7',
      'x-forwarded-for': '203.0.113.7',
    });
  });

  it('should not invent an address when there is none', () => {
    const forwarded = forwardHeaders(BROWSER, '');
    expect(forwarded['cf-connecting-ip']).toBeUndefined();
    expect(forwarded['x-forwarded-for']).toBeUndefined();
  });
});
