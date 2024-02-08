import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Collapsible, Truncate } from '@edx/paragon';
import { faCheckCircle as farCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faCheckCircle as fasCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { useModel } from '../../generic/model-store';
import SequenceLink from './SequenceLink';

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
    <div className="d-flex">
      <div className="">
        {complete ? (
          <FontAwesomeIcon
            icon={fasCheckCircle}
            fixedWidth
            className="text-success"
            aria-hidden="true"
            title={intl.formatMessage(messages.completedSection)}
          />
        ) : (
          <FontAwesomeIcon
            icon={farCheckCircle}
            fixedWidth
            className="text-gray-400"
            aria-hidden="true"
            title={intl.formatMessage(messages.incompleteSection)}
          />
        )}
      </div>
      <div className="ml-2 small">
        <span className="align-middle text-dark font-weight-bold"><Truncate lines={3}>{title}</Truncate></span>
      </div>
    </div>
  );

  return (
    <li>
      <Collapsible
        className="mb-2 text-primary border-0"
        // styling="basic"
        title={sectionTitle}
        open={sequenceIds.includes(currentSequence) ? true : open}
        onToggle={() => { setOpen(!open); }}
      >
        <ol className="list-unstyled bg-white py-2">
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
