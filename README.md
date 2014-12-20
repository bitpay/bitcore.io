Bitcore.io
=======

The Bitcore website, hosted via GitHub Pages. 

#Updating

The website is build using Hexo, and hexo commands can be used directly if globally installed. There are also gulp tasks to update the website:

```
// generate the public website
$ gulp generate-public

// update bitcore dependency
$ npm install

// update bitcore documentation and generate site
$ gulp generate

// start development server
$ gulp server

```

#Assets
Bitcore static files, theme and brand assets are in the `source` directory, and is built into the `public` directory.

#Contributing
Please open a new issue or send pull requests with ideas or suggestions.

#License
Released under the MIT license.

Copyright (c) 2014 Bitpay, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
