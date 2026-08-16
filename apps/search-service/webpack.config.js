const nodeExternals = require('webpack-node-externals');

module.exports = function (options, webpack) {
  options.externals = [
    nodeExternals({
      allowlist: [/^@shiftly\//],
    }),
    function ({ context, request }, callback) {
      if (/^@prisma\/client-/.test(request)) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ];
  return options;
};
