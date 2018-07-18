"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");
const os = require("os");

function remoteImportPlugin({ types }) {
  return {
    name: "remote-import",
    visitor: {
      ImportDeclaration(p, state) {
        // We already did that
        if (p.node.__processed) {
          return;
        }

        const { value } = p.node.source;
        let resourceURL;
        try {
          resourceURL = new URL(value);
        } catch (e) {
          // path is not a URL
          return;
        }
        const resourceName = resourceURL.pathname.split("/").slice(-1)[0];

        if (!resourceName) {
          return;
        }
        // Should we version this with a hash?
        const resourcePath = path.resolve(path.join(os.tmpdir(), resourceName));

        // Create a temporary file
        const fst = fs.createWriteStream(resourcePath);
        // And replace the import declaration with the new filepath
        const repl = types.ImportDeclaration(
          p.node.specifiers,
          types.stringLiteral(resourcePath)
        );
        // Mark it as processed so that we don't double check it
        repl.__processed = true;
        p.replaceWith(repl);

        // Download the file as a side effect.
        https.get(resourceURL.href, res => res.pipe(fst));
      }
    }
  };
}

module.exports = remoteImportPlugin;
