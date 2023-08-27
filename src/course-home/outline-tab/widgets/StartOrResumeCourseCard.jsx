import React from 'react';
import { Button } from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { useSelector } from 'react-redux';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import messages from '../messages';
import { useModel } from '../../../generic/model-store';

const StartOrResumeCourseCard = ({ intl }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);

  const {
    org,
  } = useModel('courseHomeMeta', courseId);

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const {
    resumeCourse: {
      hasVisitedCourse,
      url: resumeCourseUrl,
    },
  } = useModel('outline', courseId);

  if (!resumeCourseUrl) {
    return null;
  }

  const logResumeCourseClick = () => {
    sendTrackingLogEvent('edx.course.home.resume_course.clicked', {
      ...eventProperties,
      event_type: hasVisitedCourse ? 'resume' : 'start',
      url: resumeCourseUrl,
    });
  };

  return (
    <section className="mb-4 rounded px-4 py-3" data-testid="start-resume-card" style={{ border: '2px solid LightGray' }}>
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="mb-0">
          {hasVisitedCourse ? intl.formatMessage(messages.resumeBlurb) : intl.formatMessage(messages.startBlurb)}
        </h3>
        <Button
          variant="brand"
          href={resumeCourseUrl}
          onClick={() => logResumeCourseClick()}
          className="ml-auto"
        >
          {hasVisitedCourse ? intl.formatMessage(messages.resume) : intl.formatMessage(messages.start)}
        </Button>
      </div>
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
    </section>
  );
};

StartOrResumeCourseCard.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StartOrResumeCourseCard);
