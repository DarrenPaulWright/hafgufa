const testsContext = require.context('.', true, /\.test\.js/u);
testsContext.keys().forEach(testsContext);
