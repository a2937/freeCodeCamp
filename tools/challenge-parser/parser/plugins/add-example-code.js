const { isEmpty } = require('lodash');
const { root } = require('mdast-builder');
const visitChildren = require('unist-util-visit-children');
const { getSection } = require('./utils/get-section');
const { getFileVisitor } = require('./utils/get-file-visitor');

// TODO: DRY this.  Start with an array of markers and go from there.
function addExamples() {
  function transformer(tree, file) {
    const seedTree = root(getSection(tree, `--example--`));
    // Not all challenges have exampls (video challenges, for example), so we stop
    // processing in these cases.
    if (isEmpty(seedTree.children)) return;
    const contentsTree = root(getSection(seedTree, `--example-contents--`));
    const examples = {};

    // While before and after code are optional, the contents are not
    if (isEmpty(contentsTree.children))
      throw Error(
        '## --example-contents-- must appear in # --example-- sections'
      );

    const visitForContents = visitChildren(
      getFileVisitor(examples, 'example-contents')
    );

    visitForContents(contentsTree);
    const seedVals = examples;
    file.data = {
      ...file.data,
      exampleCode: seedVals
    };
  }

  return transformer;
}

module.exports = addExamples;
