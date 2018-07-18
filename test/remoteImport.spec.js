import pluginTester from "babel-plugin-tester";
import prettier from "prettier";
import plugin from "../src";

jest.mock("https");

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename
  },
  formatResult(result) {
    return prettier.format(result, { trailingComma: "es5" });
  },
  tests: {
    "Correct usage": {
      error: false,
      code: `
        import image from 'https://i.imgur.com/hQVq8qN.jpg'
        
        console.log(image)
      `
    },
    "Should not replace path": {
      error: false,
      code: `
        import image from './test.js'
        
        console.log(image)
      `
    },
    "Incorrect path": {
      error: false,
      code: `
        import image from 'https://www.google.com'
        
        console.log(image)
      `
    }
  }
});
