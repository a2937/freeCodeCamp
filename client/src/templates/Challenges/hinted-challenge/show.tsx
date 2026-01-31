import { graphql } from 'gatsby';
import React, { useEffect, useRef, useState } from 'react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Container, Col, Row, Button, Spacer } from '@freecodecamp/ui';
import { isEqual } from 'lodash';
import store from 'store';
import { ObserveKeys } from 'react-hotkeys';

// Local Utilities
import PrismFormatted from '../components/prism-formatted';
import LearnLayout from '../../../components/layouts/learn';
import { ChallengeNode, ChallengeMeta, Test } from '../../../redux/prop-types';
import ChallengeDescription from '../components/challenge-description';
import InteractiveEditor from '../components/interactive-editor';
import ActionRow from '../classic/action-row';
import Hotkeys from '../components/hotkeys';
import ChallengeTitle from '../components/challenge-title';
import CompletionModal from '../components/completion-modal';
import Assignments from '../components/assignments';
import {
  challengeMounted,
  updateChallengeMeta,
  openModal,
  updateSolutionFormValues,
  initTests
} from '../redux/actions';
import { isChallengeCompletedSelector } from '../redux/selectors';
import { getChallengePaths } from '../utils/challenge-paths';
import MultipleChoiceQuestions from '../components/multiple-choice-questions';
import ChallengeExplanation from '../components/challenge-explanation';
import HelpModal from '../components/help-modal';

// Styles
import './show.css';
import '../video.css';
import ExampleModal from '../components/example-modal';

// Redux Setup
const mapStateToProps = (state: unknown) => ({
  isChallengeCompleted: isChallengeCompletedSelector(state)
});

const mapDispatchToProps = {
  initTests,
  updateChallengeMeta,
  challengeMounted,
  updateSolutionFormValues,
  openCompletionModal: () => openModal('completion'),
  openHelpModal: () => openModal('help')
};

// Types
interface ShowQuizProps {
  challengeMounted: (arg0: string) => void;
  data: { challengeNode: ChallengeNode };
  description: string;
  initTests: (xs: Test[]) => void;
  isChallengeCompleted: boolean;
  openCompletionModal: () => void;
  openHelpModal: () => void;
  pageContext: {
    challengeMeta: ChallengeMeta;
  };
  updateChallengeMeta: (arg0: ChallengeMeta) => void;
  updateSolutionFormValues: () => void;
}

function renderNodule(
  nodule: ChallengeNode['challenge']['nodules'][number],
  showInteractiveEditor: boolean
) {
  switch (nodule.type) {
    case 'paragraph':
      return <PrismFormatted text={nodule.data} />;
    case 'interactiveEditor':
      if (showInteractiveEditor) {
        return <InteractiveEditor files={nodule.data} />;
      } else {
        const files = nodule.data;
        return files.map((file, index) => (
          <PrismFormatted key={index} text={file.contentsHtml} />
        ));
      }
    default:
      return null;
  }
}

const ShowHintedChallenge = ({
  challengeMounted,
  data: {
    challengeNode: {
      challenge: {
        assignments,
        block,
        description,
        nodules,
        explanation,
        challengeType,
        helpCategory,
        instructions,
        questions,
        tests,
        title,
        translationPending,
        superBlock,
        example
      }
    }
  },
  pageContext: { challengeMeta },
  initTests,
  updateChallengeMeta,
  openCompletionModal,
  openHelpModal,
  isChallengeCompleted
}: ShowQuizProps) => {
  const { t } = useTranslation();
  const container = useRef<HTMLElement | null>(null);

  const blockNameTitle = `${t(
    `intro:${superBlock}.blocks.${block}.title`
  )} - ${title}`;

  useEffect(() => {
    initTests(tests);
    const challengePaths = getChallengePaths({
      currentCurriculumPaths: challengeMeta
    });
    updateChallengeMeta({
      ...challengeMeta,
      title,
      challengeType,
      helpCategory,
      ...challengePaths
    });
    challengeMounted(challengeMeta.id);
    container.current?.focus();
    // This effect should be run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // assignments
  const [assignmentsCompleted, setAssignmentsCompleted] = useState(0);
  const allAssignmentsCompleted = assignmentsCompleted === assignments.length;

  const handleAssignmentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isCompleted = event.target.checked; // extract value before target is nullified
    setAssignmentsCompleted(a => (isCompleted ? a + 1 : a - 1));
  };

  // multiple choice questions
  const [selectedMcqOptions, setSelectedMcqOptions] = useState(
    questions.map<number | null>(() => null)
  );
  const [submittedMcqAnswers, setSubmittedMcqAnswers] = useState(
    questions.map<number | null>(() => null)
  );

  const [hasAnsweredMcqCorrectly, sethasAnsweredMcqCorrectly] = useState(true);

  const [showFeedback, setShowFeedback] = useState(false);

  const handleMcqOptionChange = (
    questionIndex: number,
    answerIndex: number
  ): void => {
    setSelectedMcqOptions(prev =>
      prev.map((option, index) =>
        index === questionIndex ? answerIndex : option
      )
    );
  };

  const handleSubmit = () => {
    const hasCompletedAssignments =
      assignments.length === 0 || allAssignmentsCompleted;
    const mcqSolutions = questions.map(question => question.solution - 1);
    const mcqCorrect = isEqual(mcqSolutions, selectedMcqOptions);

    setSubmittedMcqAnswers(selectedMcqOptions);
    setShowFeedback(true);
    if (hasCompletedAssignments && mcqCorrect) {
      openCompletionModal();
    }

    if (mcqSolutions.length > selectedMcqOptions.length || !mcqCorrect) {
      sethasAnsweredMcqCorrectly(false);
    } else {
      sethasAnsweredMcqCorrectly(true);
    }
  };

  // interactive editor
  const hasInteractiveEditor = nodules?.some(
    nodule => nodule.type === 'interactiveEditor'
  );

  const [showInteractiveEditor, setShowInteractiveEditor] = useState(
    () => !!store.get('showInteractiveEditor')
  );

  // TODO: Have it show the example with modal and questions somehow??
  const toggleInteractiveEditor = () => {
    store.set('showInteractiveEditor', !showInteractiveEditor);
    setShowInteractiveEditor(!showInteractiveEditor);
  };

  return (
    <Hotkeys executeChallenge={handleSubmit} containerRef={container}>
      <LearnLayout>
        <Helmet
          title={`${blockNameTitle} | ${t('learn.learn')} | freeCodeCamp.org`}
        />
        <Container fluid>
          {hasInteractiveEditor && (
            <ActionRow
              hasInteractiveEditor={hasInteractiveEditor}
              showInteractiveEditor={showInteractiveEditor}
              toggleInteractiveEditor={toggleInteractiveEditor}
            />
          )}

          <Container>
            <Row>
              <Spacer size='m' />
              <ChallengeTitle
                isCompleted={isChallengeCompleted}
                translationPending={translationPending}
              >
                {title}
              </ChallengeTitle>

              <Spacer size='m' />

              {description && (
                <Col md={8} mdOffset={2} sm={10} smOffset={1} xs={12}>
                  <ChallengeDescription
                    description={description}
                    superBlock={superBlock}
                  />
                  <Spacer size='m' />
                </Col>
              )}

              {nodules?.map((nodule, i) => {
                return (
                  <React.Fragment key={i}>
                    {renderNodule(nodule, showInteractiveEditor)}
                  </React.Fragment>
                );
              })}

              <Col md={8} mdOffset={2} sm={10} smOffset={1} xs={12}>
                {instructions && (
                  <>
                    <ChallengeDescription
                      instructions={instructions}
                      superBlock={superBlock}
                    />
                    <Spacer size='m' />
                  </>
                )}

                {assignments.length > 0 && (
                  <ObserveKeys only={['ctrl', 'cmd', 'enter']}>
                    <Assignments
                      assignments={assignments}
                      allAssignmentsCompleted={allAssignmentsCompleted}
                      handleAssignmentChange={handleAssignmentChange}
                    />
                  </ObserveKeys>
                )}

                {questions.length > 0 && (
                  <ObserveKeys only={['ctrl', 'cmd', 'enter']}>
                    <MultipleChoiceQuestions
                      questions={questions}
                      selectedOptions={selectedMcqOptions}
                      handleOptionChange={handleMcqOptionChange}
                      submittedMcqAnswers={submittedMcqAnswers}
                      showFeedback={showFeedback}
                      superBlock={superBlock}
                    />
                  </ObserveKeys>
                )}

                {explanation ? (
                  <ChallengeExplanation explanation={explanation} />
                ) : null}

                {!hasAnsweredMcqCorrectly && (
                  <p className='text-center'>{t('learn.answered-mcq')}</p>
                )}

                <Button block={true} variant='primary' onClick={handleSubmit}>
                  {questions.length == 0
                    ? t('buttons.submit')
                    : t('buttons.check-answer')}
                </Button>
                <Spacer size='xxs' />
                <Button block={true} variant='primary' onClick={openHelpModal}>
                  {t('buttons.ask-for-help')}
                </Button>

                <Spacer size='l' />
              </Col>
              <CompletionModal />
              <HelpModal
                challengeTitle={title}
                challengeBlock={block}
                superBlock={superBlock}
              />
              <ExampleModal exampleCode={example} />
            </Row>
          </Container>
        </Container>
      </LearnLayout>
    </Hotkeys>
  );
};

ShowHintedChallenge.displayName = 'ShowHintedChallenge';

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShowHintedChallenge);

export const query = graphql`
  query GenericChallenge($id: String!) {
    challengeNode(id: { eq: $id }) {
      challenge {
        assignments
        block
        challengeType
        description
        nodules {
          type
          data
        }
        explanation
        helpCategory
        instructions
        fields {
          slug
        }
        questions {
          text
          answers {
            answer
            feedback
            audioId
          }
          solution
        }
        superBlock
        tests {
          text
          testString
        }
        title
        example
      }
    }
  }
`;
