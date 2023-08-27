import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { injectIntl } from '@edx/frontend-platform/i18n';
import {
  faCertificate, faInfo, faCalendar, faStar,
} from '@fortawesome/free-solid-svg-icons';
import {
  faBookmark, faClock,
} from '@fortawesome/free-regular-svg-icons';
import { IconButtonWithTooltip } from '@edx/paragon';
import { useModel } from '../../../generic/model-store';
import LaunchCourseHomeTourButton from '../../../product-tours/newUserCourseHomeTour/LaunchCourseHomeTourButton';

const CourseTools = ({ activeTabSlug }) => {
  const {
    courseId,
  } = useSelector(state => state.courseHome);
  const { org } = useModel('courseHomeMeta', courseId);
  const {
    courseTools,
  } = useModel('outline', courseId);

  if (courseTools?.length === 0) {
    return null;
  }

  const eventProperties = {
    org_key: org,
    courserun_key: courseId,
  };

  const logClick = (analyticsId) => {
    const { administrator } = getAuthenticatedUser();
    sendTrackingLogEvent('edx.course.tool.accessed', {
      ...eventProperties,
      course_id: courseId, // should only be courserun_key, but left as-is for historical reasons
      is_staff: administrator,
      tool_name: analyticsId,
    });
  };

  const renderIcon = (iconClasses) => {
    switch (iconClasses) {
      case 'edx.bookmarks':
        return faBookmark;
      case 'edx.tool.verified_upgrade':
        return faCertificate;
      case 'edx.tool.financial_assistance':
        return faInfo;
      case 'edx.calendar-sync':
        return faCalendar;
      case 'edx.updates':
        return faClock;
      case 'edx.reviews':
        return faStar;
      default:
        return null;
    }
  };

  return (
    <section className="align-self-center">
      <div className="d-flex">
        {courseTools?.map((courseTool) => (
          <div key={courseTool.analyticsId}>
            <a href={courseTool.url} onClick={() => logClick(courseTool.analyticsId)}>
              <IconButtonWithTooltip
                icon={renderIcon(courseTool.analyticsId)}
                alt="Bookmark"
                variant="primary"
                className="mr-2"
                size="sm"
                tooltipPlacement="bottom"
                tooltipContent={courseTool.title}
              />
              {/* <FontAwesomeIcon icon={renderIcon(courseTool.analyticsId)} className="mr-2" fixedWidth /> */}
              {/* {courseTool.title} */}
            </a>
          </div>
        ))}
        {activeTabSlug === 'outline' && (
          <div id="courseHome-launchTourLink">
            <LaunchCourseHomeTourButton />
          </div>
        )}
      </div>
    </section>
  );
};

CourseTools.propTypes = {
  // intl: intlShape.isRequired,
  activeTabSlug: PropTypes.string.isRequired,
};

export default injectIntl(CourseTools);
