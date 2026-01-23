import { RouteComponentProps } from '@gatsbyjs/reach-router';
import React from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Spacer } from '@freecodecamp/ui';

const Lectures = (_props: RouteComponentProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div>
      <Helmet title={t('lectures.title') + ' | freeCodeCamp.org'} />
      <h1>{t('lectures.description')}.</h1>
      <Spacer size='l' />
    </div>
  );
};

export default Lectures;
