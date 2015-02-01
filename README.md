redirect-rules
=======================

Flexible redirect rule engine for connect middleware

[![npm version](https://badge.fury.io/js/redirect-rules.svg)](http://badge.fury.io/js/redirect-rules)
[![Build Status](https://travis-ci.org/godaddy/node-redirect-rules.svg?branch=master)](https://travis-ci.org/godaddy/node-redirect-rules)

# Usage

```javascript
var redirector = require('redirect-rules');
var rules = [
  {
    from: '/some/url',
    to: '/another/url'
  },
  {
    from: { path: /\/thing\/(.*?)/ },
    to: '/things/{path$1}'
  },
  {
    from: { protocol: 'http' },
    to: 'https://{host}/{url}'
  },
  {
    from: {
        path: '/workflow',
        params: { complete: true }
    },
    to: '//newdomain.com/welcome',
    status: 302
  },
  {
    from: '/some/url',
    to: {
      url: '/another/url',
      status: 302,
      headers: {
        'x-redirected-from': '{url}'
      },
      body: 'Redirecting to {redirectURL}'
    }
  }
];
app.use(redirector(rules));
```

# Description

The `redirect-rules` middleware is a flexible rules-based engine for redirecting requests. It supports matching
multiple conditions and can easily generate redirect URLs based on conditional match results.

To create the middleware, simply pass a rule object into the module-level function:

```javascript
var redirector = require('redirect-rules');
var rule = { from: '/url1', to: '/url2' };
app.use(redirector(rule));
```

To specify multiple redirect rules, pass an `Array`; the rules will be tested in order until a match is found:

```javascript
var redirector = require('redirect-rules');
var rules = [
    { from: '/url1', to: '/url2' },
    { from: '/url3', to: '/url4' }
];
app.use(redirector(rules));
```

# Rules

A rule contains up to three properties:

* `from`: Conditions for matching a request. See "Matchers" below.
* `to`: The template for the URL to redirect to. See "Redirect URLs" below.
* `status`: The status code to use for the redirect. The default is `301` (permanent).
  `to: '/url', status: 302` is synonymous with `to: { url: '/url', status: 302 }`.

## Matchers

The `from` property of rules is an map of matchers to condition values:

```javascript
{
    host: 'some.domain.com',
    path: '/some/path'
};
```

A condition value can be either a string, which is used for exact matches, a `RegExp`, or in the case of a map-based
matcher, a map of key/value pairs where the value is a string or regex. For the sake of convenience, if `from` is not
a map, it is translated to `{ url: value }`.

All string-based matches are case-insensitive, so if you need a case-sensitive match, use a regular expression.

In order to easily support JSON-based rules, if a match string is prefixed with `regex:`, the condition will treat the
remainder as a regular expression. Sample: `"hostname": "regex:/(.*?)\.rootdomain.com/i"`

The following matchers are supported:

<table>
  <thead>
    <tr>
      <th>Matcher</th><th>Sample</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>headers</code></td>
      <td><pre><code>from: { headers: { 'user-agent': /Trident/ } }</code></pre></td>
      <td>Matches when all specified HTTP headers are present</td>
    </tr>
    <tr>
      <td><code>hostname</code></td>
      <td><pre><code>from: { hostname: 'www.mydomain.com' }</code></pre></td>
      <td>Matches the host HTTP header, minus any port</td>
    </tr>
    <tr>
      <td><code>method</code></td>
      <td><pre><code>from: { hostname: 'www.mydomain.com' }</code></pre></td>
      <td>Matches the HTTP method of the request</td>
    </tr>
    <tr>
      <td><code>params</code></td>
      <td><pre><code>from: { params: { locale: /^es-/ } }</code></pre></td>
      <td>Matches when all specified query-string parameters are present</td>
    </tr>
    <tr>
      <td><code>path</code></td>
      <td><pre><code>from: { path: '/some/path' }</code></pre></td>
      <td>Matches the URL, minus the query string</td>
    </tr>
    <tr>
      <td><code>port</code></td>
      <td><pre><code>from: { port: 443 }</code></pre></td>
      <td>
        Matches the port number specified in the host header; if the port is not explicitly present in the header,
        it will assume the default port number of the protocol
      </td>
    </tr>
    <tr>
      <td><code>protocol</code></td>
      <td><pre><code>from: { protocol: 'https' }</code></pre></td>
      <td>
        Matches the protocol of the request; only http and https are supported at this time
      </td>
    </tr>
    <tr>
      <td><code>scheme</code></td>
      <td><pre><code>from: { scheme: 'https' }</code></pre></td>
      <td>Alias for protocol</td>
    </tr>
    <tr>
      <td><code>url</code></td>
      <td><pre><code>from: { url: '/some/url?foo=bar' }</code></pre></td>
      <td>Matches the path and query string of the URL. This does not include the scheme, hostname, or port</td>
    </tr>
  </tbody>
</table>

## Redirect URL formatting

The `to` property of a rule is a string for formatting the URL to redirect to. It can be a plain URL string or it
can contain variables. The variables can be aspects of the inbound request or condition match results.
If the substitution for a variable is empty, and that would result in an empty path segment, the segment is
automatically omitted. For example, if `{foo}` is empty, then `/something/{foo}/bar` becomes `/something/bar`.

The following variables are supported:

<table>
  <thead>
    <tr>
      <th>Variable</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>{headers.&lt;name&gt;}</code></td>
      <td>The value of an HTTP header</td>
    </tr>
    <tr>
      <td><code>{host}</code></td>
      <td>The value of the HTTP host header</td>
    </tr>
    <tr>
      <td><code>{hostname}</code></td>
      <td>The value of the HTTP host header, minus the port number</td>
    </tr>
    <tr>
      <td><code>{method}</code></td>
      <td>The value of the HTTP method, lower-cased</td>
    </tr>
    <tr>
      <td><code>{params.&lt;name&gt;}</code></td>
      <td>The value of a query string parameter</td>
    </tr>
    <tr>
      <td><code>{path}</code></td>
      <td>The URL, minus the protocol, hostname, port, and query string</td>
    </tr>
    <tr>
      <td><code>{port}</code></td>
      <td>The TCP port number</td>
    </tr>
    <tr>
      <td><code>{protocol}</code></td>
      <td>Either http or https</td>
    </tr>
    <tr>
      <td><code>{query}</code></td>
      <td>The query string, including the ?; accidental double-?s are automatically corrected</td>
    </tr>
    <tr>
      <td><code>{scheme}</code></td>
      <td>Alias for <code>{protocol}</code></td>
    </tr>
    <tr>
      <td><code>{url}</code></td>
      <td>The URL, minus the protocol, hostname, and port</td>
    </tr>
  </tbody>
</table>

If a `from` condition involved a regular expression containing match groups, then the match groups are available
as variables as well, based on appending `$` + the 1-based group number. For example, given this rule:

```javascript
{ from: { path: /\/customer\/(.*?)/ }, to: '//crm.mydomain.com/customers?id={path$1}' }
```

...`/customer/38239` would be redirected to `//crm.mydomain.com/customers?id=38239`.

## Additional Response Options

The `to` property of a rule may also specify additional headers and a body to go along
with the response. This is done by using an object for the `to` value. The following properties are supported:

<table>
  <thead>
    <tr>
      <th>Property</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>url</code></td>
      <td>The url to redirect to. This is equivalent to specifying a `location` header.</td>
    </tr>
    <tr>
      <td><code>status</code></td>
      <td>The status code of the response. Defaults to 301.</td>
    </tr>
    <tr>
      <td><code>headers</code></td>
      <td>An object of key/value pairs representing additional headers to send in the response</td>
    </tr>
    <tr>
      <td><code>body</code></td>
      <td>
        Content to send in the response body. See "Response Bodies" below.
      </td>
    </tr>
  </tbody>
</table>

Some shortcuts are available.

* `to: '/url` is the same as `to: { url: '/url' }`, which is the same as `to: { headers: { location: '/url' } }`.
* Setting a `status: 302` property directly on the rule is synonymous with `to: { status: 302 }`.

Header values and the body support the same placeholder substitutions available in the `to` redirect URL, with an
additional `redirectURL` placeholder also being available.

### Response Bodies

Some magic is included if you specify a response body for a redirect:

* If the body is a string and starts with '<html ', the `content-type` header will be set to `text/html`.
* If the body is a string and starts with '<', the `content-type` header will be set to `application/xml`.
* If the body is a string and has neither prefix, the `content-type` header will be set to `text/plain`.
* If the body is any other type, it will be serialized to JSON, and the `content-type` will be `application/json`.

If you do not want an automatic `content-type`, you should explicitly define a `content-type` header in the `to` rules.
