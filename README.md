> Server to pre-render and serve radial plot images

# Prerequisites

This project uses [node-canvas](https://github.com/Automattic/node-canvas) which binds to the [Cairo](http://cairographics.org/) to manipulate graphics on a low level.

Before running the server make sure you're all set following the [node-canvas setup instructions](https://github.com/Automattic/node-canvas#installation).

# Setup

```bash
git clone git@github.com:tancredi/ws-radial-plot-prerender.git
cd ws-radial-plot-prerender
npm install
```

# Running

To start the server, run `npm start`.

The server will be started `http://localhost:2000` or listen to a custom set by the `PORT` environment variable.

# Endpoints

### `GET /size/:size/?v=values[ &c=compare_values ]` - Render a shape of given size
* **Size** (`String`) - Standardised size of the rendered image - values: `small`: 250x250 | `medium`: 500x500 px | `large`: 1000x1000
* **v** (`[ Number ]`) - Comma-separated shape values.
* **c** (`[ Number ]`) - Comma-separated compare shape values.