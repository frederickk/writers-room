const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const {ESBuildMinifyPlugin} = require('esbuild-loader');

const mode = (process.env.NODE_ENV === 'production')
  ? 'production'
  : 'development';

// Array of indices to compile 'index' is accounted for already.
const pageIndices = [];

/** Creates entrypoint configs to transpile TS and SCSS. */
const generateTs = (arr) => {
  const out = {};

  arr.forEach((index) => {
    out[index] = [
      path.join(__dirname, `./src/client/ts/${index}`),
      path.join(__dirname, `./src/client/scss/${index}.scss`),
    ];
  });

  return out;
};

// Weback configuration.
module.exports = {
  mode,
  entry: Object.assign({
    index: [
      path.join(__dirname, './src/client/index'),
      path.join(__dirname, './src/client/index.scss'),
    ],
  }, generateTs(pageIndices)),
  devServer: {
    compress: true,
    headers: {
      'Cache-Control': 'no-store',
    },
    liveReload: true,
    static: {
      directory: path.join(__dirname, 'static'),
      watch: true,
    },
    port: 8080,
    watchFiles: ['src/**/*.njk', 'src/**/*.scss', 'src/**/*.ts'],
  },
  watchOptions: {
    poll: true,
    ignored: /node_modules/,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.(ts|tsx)?$/i,
      loader: 'esbuild-loader',
      options: {
        loader: 'ts',
        target: 'es2015'
      }
    },
    {
      test: /\.(png|jpg|jpe?g|gif)$/i,
      type: 'asset/resource',
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
      type: 'asset/inline',
    },
    {
      test: /\.css|\.s(c|a)ss$/,
      use: [
        {
          loader: 'lit-scss-loader',
          options: {
            minify: true, // defaults to false
          },
        },
        'extract-loader',
        'css-loader',
        'sass-loader'
      ],
      include: [
        path.resolve(__dirname, 'src/client/components')
      ],
    },
    {
      test: /\.(sa|sc|c)ss$/i,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      exclude: [
        path.resolve(__dirname, 'src/client/components')
      ],
    }],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{
        from: './src/client/images',
        to: '../static',
      }],
    }),
    new MiniCssExtractPlugin({
      filename: () => {
        return '../static/[name].min.css';
      },
    }),
    {
      apply: (compiler) => {
        if (mode === 'production') {
          compiler.hooks.done.tap('DonePlugin', (_stats) => {
            setTimeout(() => {
              process.exit(0);
            });
          });
        } else {
          return;
        }
      }
    }
  ],
  optimization: {
    minimize: true,
    minimizer: [new ESBuildMinifyPlugin({
      target: 'es2015',
      css: true
    })],
  },
  output: {
    path: path.join(__dirname, 'static'),
    publicPath: path.join(__dirname, 'static'),
    filename: '[name].min.js',
    assetModuleFilename: '[name][ext]',
  },
  target: 'web',
};
