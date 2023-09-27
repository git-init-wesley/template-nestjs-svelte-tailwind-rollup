<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/git-init-wesley/template-nestjs-svelte-tailwind-rollup">template-nestjs-svelte-tailwind-rollup</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://github.com/git-init-wesley">Wesley LEVASSEUR</a> is licensed under <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY-NC-SA 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1"></a></p>

# Explaination

Routify with Rollup will be able to build Svelte statically.
This construction is located:

- `public/build/bundle.js`
- `public/build/bundle.js.map`
- `public/build/bundle.css`

Tailwind being included in the project, manually and automatically the construction of the CSS is located:

- `public/build/tailwind.css`

NestJS will be built in the folder(s):

- `dist`
- `dist/api`

In this template/project, we can see `commons`:

- `dist/commons`

Our `src` will be composed like this:

- `src/api` - Arranged this way in the project (aka `server`)
- `src/commons` - (aka `libs` or `lib`)
- `src/pages` - Required for Routify
- `src/svelte` - Arranged this way in the project for Rollup (aka `client`)

## Installation

```bash
# npx
$ npx degit git-init-wesley/template-nestjs-svelte-tailwind-rollup
# or yarn
$ yarn degit git-init-wesley/template-nestjs-svelte-tailwind-rollup
```

## Step to production

```bash
# Install
$ npm install
# Or Clean Install
$ npm ci

# Build Application (NestJS + Svelte)
$ npm run build

# Start the application locally
$ npm run start
```

### Dist

> `/dist/api/main` - Node main path
> `/dist/api` - NestJS bundles
> `/dist/commons` - Commons

### Public

> `/public/build/**` - Bundles (editing is not recommended)
>
> `/public/index.html` - Can be edited
>
> `/public/robots.txt` - Can be edited
>
> `/public/assets/**` - Can be edited

## Running the app

```bash
# build
$ npm run build

# development
$ npm run dev

# tailwind
$ npm run tailwind

# tailwind + watch mode
$ npm run tailwind:watch
```

## Running the nest app (Only nest)

```bash
# build
$ npm run build:api

# development
$ npm run start

# watch mode
$ npm run start:dev

# debug + watch mode
$ npm run start:debug

# production mode
$ npm run start:prod
```

## Tests

_Some example tests were created for this template._

```bash
# unit tests
$ npm run test
$ npm run test:watch

# e2e tests
$ npm run test:e2e
$ npm run test:e2e:watch

# test coverage
$ npm run test:cov

# test debug
$ npm run test:debug

# all tests (unit + e2e)
$ npm run test:all
$ npm run test:all:watch
```

## Stay in touch

\*Author - **[Wesley LEVASSEUR](https://github.com/git-init-wesley)\***

## License

\*This template is **[CC BY-NC-SA 4.0](LICENSE.md).\***
