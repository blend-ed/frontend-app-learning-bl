import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';

import { getConfig } from '@edx/frontend-platform';
import {
  Button,
  Layout,
  Scrollable,
  useToggle,
} from '@edx/paragon';

import useEnrollmentAlert from '../alerts/enrollment-alert';
import useLogistrationAlert from '../alerts/logistration-alert';
import { CourseTabsNavigation } from '../course-tabs';
import { useModel } from '../generic/model-store';
import { AlertList } from '../generic/user-messages';
import InstructorToolbar from '../instructor-toolbar';
import StreakModal from '../shared/streak-celebration';

import Section from '../course-home/outline-tab/Section';
import ProductTours from '../product-tours/ProductTours';

const LoadedTabPage = ({
  activeTabSlug,
  children,
  courseId,
  metadataModel,
  unitId,
  sequenceId,
}) => {
  const {
    celebrations,
    org,
    originalUserIsStaff,
    tabs,
    title,
    verifiedMode,
  } = useModel('courseHomeMeta', courseId);

  const [expandAll, setExpandAll] = useState(false);

  const {
    courseBlocks: {
      courses,
      sections,
    } = {},
  } = useModel('outline', courseId);

  // Logistration and enrollment alerts are only really used for the outline tab, but loaded here to put them above
  // breadcrumbs when they are visible.
  const logistrationAlert = useLogistrationAlert(courseId);
  const enrollmentAlert = useEnrollmentAlert(courseId);

  const activeTab = tabs.filter(tab => tab.slug === activeTabSlug)[0];

  const streakLengthToCelebrate = celebrations && celebrations.streakLengthToCelebrate;
  const streakDiscountCouponEnabled = celebrations && celebrations.streakDiscountEnabled && verifiedMode;
  const [isStreakCelebrationOpen, , closeStreakCelebration] = useToggle(streakLengthToCelebrate);
  const rootCourseId = courses && Object.keys(courses)[0];

  if (activeTabSlug === 'courseware') {
    return (
      <div style={{ overflow: 'hidden' }}>
        <Layout
          md={[{ span: 3, offset: 0 }, { span: 9, offset: 0 }]}
        >
          <Layout.Element
            className="bg-white border"
            style={{
              zIndex: 4,
              minHeight: '100vh',
            }}
          >
            {rootCourseId && (
              <Scrollable
                style={{
                  bottom: '0',
                  top: '3.3em',
                  position: 'fixed',
                  width: '24.2vw',
                  overflowX: 'hidden',
                }}
                className="px-3"
              >
                <div className="px-2">
                  <Button
                    className="my-3"
                    variant="light"
                    size="sm"
                    block
                    onClick={() => { setExpandAll(!expandAll); }}
                  >
                    {expandAll ? 'Collapse All' : 'Expand All'}
                  </Button>
                </div>
                <ol id="courseHome-outline" className="list-unstyled">
                  {courses[rootCourseId].sectionIds.map((sectionId) => (
                    <Section
                      currentSequence={sequenceId}
                      key={sectionId}
                      courseId={courseId}
                      defaultOpen={sections[sectionId].resumeBlock}
                      expand={expandAll}
                      section={sections[sectionId]}
                    />
                  ))}
                </ol>
              </Scrollable>
            )}
          </Layout.Element>
          <Layout.Element className="mt-5 pl-0">
            <ProductTours
              activeTab={activeTabSlug}
              courseId={courseId}
              isStreakCelebrationOpen={isStreakCelebrationOpen}
              org={org}
            />
            <Helmet>
              <title>{`${activeTab ? `${activeTab.title} | ` : ''}${title} | ${getConfig().SITE_NAME}`}</title>
            </Helmet>
            {originalUserIsStaff && (
              <div
                className="mb-n6"
                style={{
                  zIndex: 0,
                  marginTop: '5.3rem',
                }}
              >
                <InstructorToolbar
                  courseId={courseId}
                  unitId={unitId}
                  tab={activeTabSlug}
                />
              </div>
            )}
            <StreakModal
              courseId={courseId}
              metadataModel={metadataModel}
              streakLengthToCelebrate={streakLengthToCelebrate}
              isStreakCelebrationOpen={!!isStreakCelebrationOpen}
              closeStreakCelebration={closeStreakCelebration}
              streakDiscountCouponEnabled={streakDiscountCouponEnabled}
              verifiedMode={verifiedMode}
            />
            <main id="main-content">
              <AlertList
                topic="outline"
                className="mx-5 mt-3"
                customAlerts={{
                  ...enrollmentAlert,
                  ...logistrationAlert,
                }}
              />
              <div
                style={{
                  position: 'fixed',
                  top: '3.3em',
                  left: '24vw',
                  right: 0,
                  backgroundColor: 'white',
                  zIndex: 3,
                }}
              >
                <CourseTabsNavigation tabs={tabs} activeTabSlug="outline" />
              </div>
              <div className="container-xl mt-6">
                {children}
              </div>
            </main>
          </Layout.Element>
        </Layout>
      </div>
    );
  }

  return (
    <div>
      <ProductTours
        activeTab={activeTabSlug}
        courseId={courseId}
        isStreakCelebrationOpen={isStreakCelebrationOpen}
        org={org}
      />
      <Helmet>
        <title>{`${activeTab ? `${activeTab.title} | ` : ''}${title} | ${getConfig().SITE_NAME}`}</title>
      </Helmet>
      {originalUserIsStaff && (
        <InstructorToolbar
          courseId={courseId}
          unitId={unitId}
          tab={activeTabSlug}
        />
      )}
      <StreakModal
        courseId={courseId}
        metadataModel={metadataModel}
        streakLengthToCelebrate={streakLengthToCelebrate}
        isStreakCelebrationOpen={!!isStreakCelebrationOpen}
        closeStreakCelebration={closeStreakCelebration}
        streakDiscountCouponEnabled={streakDiscountCouponEnabled}
        verifiedMode={verifiedMode}
      />
      <main id="main-content" className="d-flex flex-column flex-grow-1">
        <AlertList
          topic="outline"
          className="mx-5 mt-3"
          customAlerts={{
            ...enrollmentAlert,
            ...logistrationAlert,
          }}
        />
        <CourseTabsNavigation tabs={tabs} className="" activeTabSlug={activeTabSlug} />
        <div className="container-xl">
          {children}
        </div>
      </main>
    </div>
  );
};

LoadedTabPage.propTypes = {
  activeTabSlug: PropTypes.string.isRequired,
  children: PropTypes.node,
  courseId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string,
  metadataModel: PropTypes.string,
  unitId: PropTypes.string,
};

LoadedTabPage.defaultProps = {
  children: null,
  metadataModel: 'courseHomeMeta',
  unitId: null,
  sequenceId: null,
};

export default LoadedTabPage;
