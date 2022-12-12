import esbuild from 'esbuild';
const options = {
  entryPoints: ['src/index.js'],
  outfile: 'dist/pixoo-doodle.js',
  bundle: true,
  format: 'esm',
};

if(process.env.mode === 'production') {
  esbuild.buildSync({minify: false, ...options});
  esbuild.buildSync({minify: true, ...options, entryPoints: ['src/iife.js'], format: 'iife', outfile: 'dist/pixoo-doodle.min.js'});
} else {
  esbuild.serve({
    servedir: 'examples',
  }, {
    ...options,
    outfile: 'examples/pixoo-doodle.js',
  }).then((server) => {
    console.log(`Server is running at ${server.host}:${server.port}`);
  });
}