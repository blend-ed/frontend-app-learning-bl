/* eslint-disable no-use-before-define */
import SequenceExamWrapper from '@edx/frontend-lib-special-exams';
import { history } from '@edx/frontend-platform';
import {
  sendTrackEvent,
  sendTrackingLogEvent,
} from '@edx/frontend-platform/analytics';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { breakpoints, useWindowSize } from '@edx/paragon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {
  useEffect, useState,
} from 'react';
import { useSelector } from 'react-redux';

import { useSequenceBannerTextAlert, useSequenceEntranceExamAlert } from '../../../alerts/sequence-alerts/hooks';
import PageLoading from '../../../generic/PageLoading';
import { useModel } from '../../../generic/model-store';

import Sidebar from '../sidebar/Sidebar';
import SidebarTriggers from '../sidebar/SidebarTriggers';
import SequenceContent from './SequenceContent';
import HiddenAfterDue from './hidden-after-due';
import messages from './messages';
import { SequenceNavigation, UnitNavigation } from './sequence-navigation';

const Sequence = ({
  unitId,
  sequenceId,
  courseId,
  unitNavigationHandler,
  nextSequenceHandler,
  previousSequenceHandler,
  intl,
}) => {
  const [scrollY, setScrollY] = useState(0);

  // Add an event listener to track the scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Attach the event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const course = useModel('coursewareMeta', courseId);
  const {
    isStaff,
    originalUserIsStaff,
  } = useModel('courseHomeMeta', courseId);
  const sequence = useModel('sequences', sequenceId);
  const unit = useModel('units', unitId);
  const sequenceStatus = useSelector(state => state.courseware.sequenceStatus);
  const sequenceMightBeUnit = useSelector(state => state.courseware.sequenceMightBeUnit);
  const shouldDisplayNotificationTriggerInSequence = useWindowSize().width < breakpoints.small.minWidth;

  const handleNext = () => {
    const nextIndex = sequence.unitIds.indexOf(unitId) + 1;
    if (nextIndex < sequence.unitIds.length) {
      const newUnitId = sequence.unitIds[nextIndex];
      handleNavigate(newUnitId);
    } else {
      nextSequenceHandler();
    }
  };

  const handlePrevious = () => {
    const previousIndex = sequence.unitIds.indexOf(unitId) - 1;
    if (previousIndex >= 0) {
      const newUnitId = sequence.unitIds[previousIndex];
      handleNavigate(newUnitId);
    } else {
      previousSequenceHandler();
    }
  };

  const handleNavigate = (destinationUnitId) => {
    unitNavigationHandler(destinationUnitId);
  };

  const logEvent = (eventName, widgetPlacement, targetUnitId) => {
    // Note: tabs are tracked with a 1-indexed position
    // as opposed to a 0-index used throughout this MFE
    const currentIndex = sequence.unitIds.length > 0 ? sequence.unitIds.indexOf(unitId) : 0;
    const payload = {
      current_tab: currentIndex + 1,
      id: unitId,
      tab_count: sequence.unitIds.length,
      widget_placement: widgetPlacement,
    };
    if (targetUnitId) {
      const targetIndex = sequence.unitIds.indexOf(targetUnitId);
      payload.target_tab = targetIndex + 1;
    }
    sendTrackEvent(eventName, payload);
    sendTrackingLogEvent(eventName, payload);
  };

  useSequenceBannerTextAlert(sequenceId);
  useSequenceEntranceExamAlert(courseId, sequenceId, intl);

  useEffect(() => {
    function receiveMessage(event) {
      const { type } = event.data;
      if (type === 'entranceExam.passed') {
        // I know this seems (is) intense. It is implemented this way since we need to refetch the underlying
        // course blocks that were originally hidden because the Entrance Exam was not passed.
        global.location.reload();
      }
    }
    global.addEventListener('message', receiveMessage);
  }, []);

  const [unitHasLoaded, setUnitHasLoaded] = useState(false);
  const handleUnitLoaded = () => {
    setUnitHasLoaded(true);
  };

  // We want hide the unit navigation if we're in the middle of navigating to another unit
  // but not if other things about the unit change, like the bookmark status.
  // The array property of this useEffect ensures that we only hide the unit navigation
  // while navigating to another unit.
  useEffect(() => {
    if (unit) {
      setUnitHasLoaded(false);
    }
  }, [(unit || {}).id]);

  // If sequence might be a unit, we want to keep showing a spinner - the courseware container will redirect us when
  // it knows which sequence to actually go to.
  const loading = sequenceStatus === 'loading' || (sequenceStatus === 'failed' && sequenceMightBeUnit);
  if (loading) {
    if (!sequenceId) {
      return (<div> {intl.formatMessage(messages.noContent)} </div>);
    }
    return (
      <PageLoading
        srMessage={intl.formatMessage(messages.loadingSequence)}
      />
    );
  }

  if (sequenceStatus === 'loaded' && sequence.isHiddenAfterDue) {
    // Shouldn't even be here - these sequences are normally stripped out of the navigation.
    // But we are here, so render a notice instead of the normal content.
    return <HiddenAfterDue courseId={courseId} />;
  }

  const gated = sequence && sequence.gatedContent !== undefined && sequence.gatedContent.gated;
  const goToCourseExitPage = () => {
    history.push(`/course/${courseId}/course-end`);
  };

  const defaultContent = (
    <div className="sequence-container d-inline-flex flex-row mt-4 px-6">
      <div className={classNames('sequence w-100', { 'position-relative': shouldDisplayNotificationTriggerInSequence })}>
        <div
          style={{
            position: 'fixed',
            top: '5.53em',
            left: '24vw',
            right: 0,
            backgroundColor: 'white',
            zIndex: 2,
          }}
        >
          <SequenceNavigation
            sequenceId={sequenceId}
            unitId={unitId}
            className=""
            nextSequenceHandler={() => {
              logEvent('edx.ui.lms.sequence.next_selected', 'top');
              handleNext();
            }}
            onNavigate={(destinationUnitId) => {
              logEvent('edx.ui.lms.sequence.tab_selected', 'top', destinationUnitId);
              handleNavigate(destinationUnitId);
            }}
            previousSequenceHandler={() => {
              logEvent('edx.ui.lms.sequence.previous_selected', 'top');
              handlePrevious();
            }}
            goToCourseExitPage={() => goToCourseExitPage()}
          />
        </div>
        {shouldDisplayNotificationTriggerInSequence && <SidebarTriggers />}

        <div className="unit-container flex-grow-1 mt-4">
          <SequenceContent
            courseId={courseId}
            gated={gated}
            sequenceId={sequenceId}
            unitId={unitId}
            unitLoadedHandler={handleUnitLoaded}
          />
          {unitHasLoaded && (
            <UnitNavigation
              sequenceId={sequenceId}
              unitId={unitId}
              onClickPrevious={() => {
                logEvent('edx.ui.lms.sequence.previous_selected', 'bottom');
                handlePrevious();
              }}
              onClickNext={() => {
                logEvent('edx.ui.lms.sequence.next_selected', 'bottom');
                handleNext();
              }}
              goToCourseExitPage={() => goToCourseExitPage()}
            />
          )}
        </div>
      </div>
      <Sidebar />
    </div>
  );

  let topValue = '8em';

  if (originalUserIsStaff) {
    topValue = scrollY < 30 ? '11.3em' : '8em';
  }

  let marginTopValue;

  if (sequence.isTimeLimited) {
    marginTopValue = '6rem';
  } else {
    marginTopValue = '2rem';
  }

  if (sequenceStatus === 'loaded') {
    return (
      <div>
        <div
          style={{
            position: 'fixed',
            top: topValue,
            left: '24vw',
            right: 0,
            zIndex: 3,
            // marginLeft: '0.7em',
            // marginRight: '0.5em',
          }}
          id="sequence-exam-wrapper"
        >
          <SequenceExamWrapper
            sequence={sequence}
            courseId={courseId}
            isStaff={isStaff}
            originalUserIsStaff={originalUserIsStaff}
            canAccessProctoredExams={course.canAccessProctoredExams}
          >
            <div />
          </SequenceExamWrapper>
        </div>
        <div
          style={{
            marginTop: marginTopValue,
          }}
        >
          {defaultContent}
        </div>
      </div>
    );
  }

  // sequence status 'failed' and any other unexpected sequence status.
  return (
    <p className="text-center py-5 mx-auto" style={{ maxWidth: '30em' }}>
      {intl.formatMessage(messages.loadFailure)}
    </p>
  );
};

Sequence.propTypes = {
  unitId: PropTypes.string,
  sequenceId: PropTypes.string,
  courseId: PropTypes.string.isRequired,
  unitNavigationHandler: PropTypes.func.isRequired,
  nextSequenceHandler: PropTypes.func.isRequired,
  previousSequenceHandler: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

Sequence.defaultProps = {
  sequenceId: null,
  unitId: null,
};

export default injectIntl(Sequence);
