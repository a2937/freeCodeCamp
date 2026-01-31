import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { Button, FormControl, Modal, Spacer } from '@freecodecamp/ui';

import { t } from 'i18next';
import envData from '../../../../config/env.json';
import { createQuestion, closeModal } from '../redux/actions';
import { isExampleModalOpenSelector } from '../redux/selectors';

import './help-modal.css';
import callGA from '../../../analytics/call-ga';

interface ExampleModalProps {
  closeExampleModal: () => void;
  createQuestion: (description: string) => void;
  isOpen?: boolean;
  challengeTitle: string;
  challengeBlock: string;
  superBlock: string;
  exampleCode: string;
}

const { forumLocation } = envData;
const DESCRIPTION_MIN_CHARS = 50;
const DESCRIPTION_MAX_CHARS = 500;
const RSA = forumLocation + '/t/19514';

const mapStateToProps = (state: unknown) => ({
  isOpen: isExampleModalOpenSelector(state) as boolean
});
const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    { createQuestion, closeExampleModal: () => closeModal('help') },
    dispatch
  );



function ExampleModal({
  closeExampleModal,
  createQuestion,
  isOpen,
  exampleCode
}: ExampleModalProps): JSX.Element {
  const { t } = useTranslation();
  const [showExampleForm, setShowExampleForm] = useState(false);
  const [description, setDescription] = useState('');
  const [readSearchCheckbox, setReadSearchCheckbox] = useState(false);
  const [similarQuestionsCheckbox, setSimilarQuestionsCheckbox] =
    useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (showExampleForm) {
      formRef.current?.querySelector('input')?.focus();
    }
  }, [showExampleForm]);

  const canSubmitForm = useMemo(() => {
    return (
      description.length >= DESCRIPTION_MIN_CHARS &&
      readSearchCheckbox &&
      similarQuestionsCheckbox
    );
  }, [description, readSearchCheckbox, similarQuestionsCheckbox]);

  const resetFormValues = () => {
    setDescription('');
    setReadSearchCheckbox(false);
    setSimilarQuestionsCheckbox(false);
  };

  const handleClose = () => {
    closeExampleModal();
    setShowExampleForm(false);
    resetFormValues();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!canSubmitForm) {
      return;
    }

    setShowExampleForm(false);
    resetFormValues();
    createQuestion(description);
    closeExampleModal();
  };

  if (isOpen) {
    callGA({ event: 'pageview', pagePath: '/help-modal' });
  }
  return (
    <Modal onClose={handleClose} open={!!isOpen}>
      <Modal.Header closeButtonClassNames='close'>
        {t('buttons.ask-for-help')}
      </Modal.Header>
      <Modal.Body>
        {showExampleForm ? (
          <form onSubmit={handleSubmit} ref={formRef}>
            <fieldset>
              <legend className='help-form-legend'>
                {t('learn.must-confirm-statements')}
              </legend>


              <Spacer size='xs' />

            </fieldset>

            <Spacer size='s' />

            <code id="help-code">
              {exampleCode}
            </code>

            <FormControl
              id='help-modal-form-description'
              name='description'
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setDescription(event.target.value);
              }}
              componentClass='textarea'
              rows={5}
              value={description}
              placeholder={t('forum-help.describe')}
              minLength={DESCRIPTION_MIN_CHARS}
              maxLength={DESCRIPTION_MAX_CHARS}
              required
            />

            <Spacer size='s' />

            {description.length < DESCRIPTION_MIN_CHARS ? (
              <p>
                {t('learn.minimum-characters', {
                  characters: DESCRIPTION_MIN_CHARS - description.length
                })}
              </p>
            ) : (
              <p>
                {t('learn.characters-left', {
                  characters: DESCRIPTION_MAX_CHARS - description.length
                })}
              </p>
            )}

            <Spacer size='xxs' />

            <Button
              block={true}
              size='large'
              variant='primary'
              type='submit'
              disabled={!canSubmitForm}
            >
              {t('buttons.submit')}
            </Button>
            <Spacer size='xxs' />
            <Button
              block={true}
              size='large'
              variant='primary'
              onClick={handleClose}
            >
              {t('buttons.cancel')}
            </Button>
          </form>
        ) : (
          <>
            <div className='help-text-warning'>
              <p>
                <Trans i18nKey='learn.tried-rsa'>
                  <a href={RSA} rel='noopener noreferrer' target='_blank'>
                    placeholder
                  </a>
                </Trans>
              </p>
            </div>

            <Button
              block={true}
              size='large'
              variant='primary'
              onClick={() => setShowExampleForm(true)}
            >
              {t('buttons.create-post')}
            </Button>
            <Spacer size='xxs' />
            <Button
              block={true}
              size='large'
              variant='primary'
              onClick={closeExampleModal}
            >
              {t('buttons.cancel')}
            </Button>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

ExampleModal.displayName = 'ExampleModal';

export default connect(mapStateToProps, mapDispatchToProps)(ExampleModal);
