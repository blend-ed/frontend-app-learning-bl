import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible, Truncate } from '@edx/paragon';
import { faCheckCircle as fasCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle as farCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SequenceLink from './SequenceLink';
import { useModel } from '../../generic/model-store';

import messages from './messages';

const Section = ({
  courseId,
  defaultOpen,
  expand,
  intl,
  section,
  currentSequence,
}) => {
  const {
    complete,
    sequenceIds,
    title,
  } = section;
  const {
    courseBlocks: {
      sequences,
    },
  } = useModel('outline', courseId);

  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(expand);
  }, [expand]);

  useEffect(() => {
    setOpen(defaultOpen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setOpen(sequenceIds.includes(currentSequence));
  }, [currentSequence, defaultOpen, sequenceIds]);

  const sectionTitle = (
    <div className="d-flex ml-2">
      <div className="">
        {complete ? (
          <FontAwesomeIcon
            icon={fasCheckCircle}
            fixedWidth
            className="float-left mt-1 text-success"
            aria-hidden="true"
            title={intl.formatMessage(messages.completedSection)}
          />
        ) : (
          <FontAwesomeIcon
            icon={farCheckCircle}
            fixedWidth
            className="float-left mt-1 text-gray-400"
            aria-hidden="true"
            title={intl.formatMessage(messages.incompleteSection)}
          />
        )}
      </div>
      <div className="ml-3 p-0 small text-dark-500">
        <span className="align-middle text-white"><Truncate lines={3}>{title}</Truncate></span>
      </div>
    </div>
  );

  return (
    <li>
      <Collapsible
        className="mb-2 text-white"
        styling="basic"
        title={sectionTitle}
        open={sequenceIds.includes(currentSequence) ? true : open}
        onToggle={() => { setOpen(!open); }}
      >
        <ol className="list-unstyled bg-primary-900 m-n2 py-2 px-2 mr-n1">
          {sequenceIds.map((sequenceId, index) => (
            <SequenceLink
              key={sequenceId}
              id={sequenceId}
              courseId={courseId}
              sequence={sequences[sequenceId]}
              first={index === 0}
              currentSequence={currentSequence}
            />
          ))}
        </ol>
      </Collapsible>
    </li>
  );
};

Section.propTypes = {
  courseId: PropTypes.string.isRequired,
  currentSequence: PropTypes.string.isRequired,
  defaultOpen: PropTypes.bool.isRequired,
  expand: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  section: PropTypes.shape().isRequired,
};

export default injectIntl(Section);
