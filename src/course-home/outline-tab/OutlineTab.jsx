import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';
import { history } from '@edx/frontend-platform';
import { Button } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AlertList } from '../../generic/user-messages';

import CourseDates from './widgets/CourseDates';
import CourseHandouts from './widgets/CourseHandouts';
import StartOrResumeCourseCard from './widgets/StartOrResumeCourseCard';
import WeeklyLearningGoalCard from './widgets/WeeklyLearningGoalCard';
import { fetchOutlineTab } from '../data';
import ShiftDatesAlert from '../suggested-schedule-messaging/ShiftDatesAlert';
import UpgradeToShiftDatesAlert from '../suggested-schedule-messaging/UpgradeToShiftDatesAlert';
import useCertificateAvailableAlert from './alerts/certificate-status-alert';
import useCourseEndAlert from './alerts/course-end-alert';
import useCourseStartAlert from '../../alerts/course-start-alert';
import usePrivateCourseAlert from './alerts/private-course-alert';
import useScheduledContentAlert from './alerts/scheduled-content-alert';
import { useModel } from '../../generic/model-store';
import WelcomeMessage from './widgets/WelcomeMessage';
import ProctoringInfoPanel from './widgets/ProctoringInfoPanel';
import AccountActivationAlert from '../../alerts/logistration-alert/AccountActivationAlert';
import messages from './messages';
import SectionOld from './SectionOld';

const OutlineTab = ({ intl }) => { // {intl}
  const {
    courseId,
    proctoringPanelStatus,
  } = useSelector(state => state.courseHome);

  const {
    isSelfPaced,
    org,
  } = useModel('courseHomeMeta', courseId);

  const {
    courseBlocks: {
      courses,
      sections,
    },
    courseGoals: {
      selectedGoal,
      weeklyLearningGoalEnabled,
    } = {},
    datesWidget: {
      courseDateBlocks,
    },
    enableProctoredExams,
  } = useModel('outline', courseId);

  const [expandAll, setExpandAll] = useState(false);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  // Below the course title alerts (appearing in the order listed here)
  const courseStartAlert = useCourseStartAlert(courseId);
  const courseEndAlert = useCourseEndAlert(courseId);
  const certificateAvailableAlert = useCertificateAvailableAlert(courseId);
  const privateCourseAlert = usePrivateCourseAlert(courseId);
  const scheduledContentAlert = useScheduledContentAlert(courseId);

  const rootCourseId = courses && Object.keys(courses)[0];

  const hasDeadlines = courseDateBlocks && courseDateBlocks.some(x => x.dateType === 'assignment-due-date');

  const logUpgradeToShiftDatesLinkClick = () => {
    sendTrackEvent('edx.bi.ecommerce.upsell_links_clicked', {
      ...eventProperties,
      linkCategory: 'personalized_learner_schedules',
      linkName: 'course_home_upgrade_shift_dates',
      linkType: 'button',
      pageName: 'course_home',
    });
  };

  // const isEnterpriseUser = () => {
  //   const authenticatedUser = getAuthenticatedUser();
  //   const userRoleNames = authenticatedUser ? authenticatedUser.roles.map(role => role.split(':')[0]) : [];

  //   return userRoleNames.includes('enterprise_learner');
  // };

  /** show post enrolment survey to only B2C learners */
  // const learnerType = isEnterpriseUser() ? 'enterprise_learner' : 'b2c_learner';

  const location = useLocation();

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    const startCourse = currentParams.get('start_course');
    if (startCourse === '1') {
      sendTrackEvent('enrollment.email.clicked.startcourse', {});

      // Deleting the course_start query param as it only needs to be set once
      // whenever passed in query params.
      currentParams.delete('start_course');
      history.replace({
        search: currentParams.toString(),
      });
    }
  }, [location.search]);

  return (
    <div className="row course-outline-tab mt-4 mr-0">
      <AccountActivationAlert />
      <div className="col-12">
        <AlertList
          topic="outline-private-alerts"
          customAlerts={{
            ...privateCourseAlert,
          }}
        />
      </div>
      <div className="col col-12 col-md-9 pl-4 pr-2">
        <AlertList
          topic="outline-course-alerts"
          className="mb-3"
          customAlerts={{
            ...certificateAvailableAlert,
            ...courseEndAlert,
            ...courseStartAlert,
            ...scheduledContentAlert,
          }}
        />
        {isSelfPaced && hasDeadlines && (
          <>
            <ShiftDatesAlert model="outline" fetch={fetchOutlineTab} />
            <UpgradeToShiftDatesAlert model="outline" logUpgradeLinkClick={logUpgradeToShiftDatesLinkClick} />
          </>
        )}
        <StartOrResumeCourseCard />
        <WelcomeMessage courseId={courseId} />
        {rootCourseId && (
          <>
            <div className="row w-100 m-0 mb-3 justify-content-end">
              <div className="col-12 col-md-auto p-0">
                <Button variant="light" size="sm" block onClick={() => { setExpandAll(!expandAll); }}>
                  {expandAll ? intl.formatMessage(messages.collapseAll) : intl.formatMessage(messages.expandAll)}
                </Button>
              </div>
            </div>
            <ol id="courseHome-outline" className="list-unstyled">
              {courses[rootCourseId].sectionIds.map((sectionId) => (
                <SectionOld
                  key={sectionId}
                  courseId={courseId}
                  defaultOpen={sections[sectionId].resumeBlock}
                  expand={expandAll}
                  section={sections[sectionId]}
                />
              ))}
            </ol>
          </>
        )}
      </div>
      {rootCourseId && (
        <div className="col col-12 col-md-3">
          <ProctoringInfoPanel />
          { /** Defer showing the goal widget until the ProctoringInfoPanel has resolved or has been determined as
           disabled to avoid components bouncing around too much as screen is rendered */ }
          {(!enableProctoredExams || proctoringPanelStatus === 'loaded') && weeklyLearningGoalEnabled && (
            <WeeklyLearningGoalCard
              daysPerWeek={selectedGoal && 'daysPerWeek' in selectedGoal ? selectedGoal.daysPerWeek : null}
              subscribedToReminders={selectedGoal && 'subscribedToReminders' in selectedGoal ? selectedGoal.subscribedToReminders : false}
            />
          )}
          <CourseDates />
          <CourseHandouts />
        </div>
      )}
    </div>
  );
};

OutlineTab.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(OutlineTab);
