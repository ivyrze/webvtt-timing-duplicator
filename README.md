# WebVTT Timing Duplicator

This web utility allows you to copy the timings from a .vtt file over to an untimed, plain-text transcript. An example use case is with caption translations. It employs a rudimentary algorithm to additionally carry over the captions' line formatting, e.g. a baked in maximum characters per line.

## Development

Start by installing project dependencies.

```
npm install
```

Then start a continuous build process with:

```
npm run develop
```

Finally, start your development server from `dist/`.

```
npm install -g netlify-cli
netlify dev
```

## License

This project is published under a GPLv3 license.