const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    entry: {
      background: './src/background/background.ts',
      content: './src/content/content.ts',
      dashboard: './src/dashboard/dashboard.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@core': path.resolve(__dirname, 'src/core'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@features': path.resolve(__dirname, 'src/features'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@app-types': path.resolve(__dirname, 'src/types'),
        '@ui': path.resolve(__dirname, 'src/ui'),
      },
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new CopyPlugin({
        patterns: [
          { from: 'public/manifest.json', to: 'manifest.json' },
          { from: 'public/icons', to: 'icons' },
          { from: 'public/*.html', to: '[name][ext]' },
        ],
      }),
    ],
    devtool: isDev ? 'inline-source-map' : false,
    optimization: {
      minimize: !isDev,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10,
          },
          core: {
            test: /[\\/]src[\\/]core[\\/]/,
            name: 'core',
            priority: 5,
          },
          services: {
            test: /[\\/]src[\\/]services[\\/]/,
            name: 'services',
            priority: 5,
          },
        },
      },
    },
  };
};
