import { Router } from '@gatsbyjs/reach-router';
import React from 'react';
import Lectures from '../components/Lectures';

function LecturesPage(): JSX.Element {
  return (
    <Router>
      {/* Error from installing @types/react-helmet and @types/react-redux */}
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <Lectures default />
    </Router>
  );
}

LecturesPage.displayName = 'LecturesPage';

export default LecturesPage;
