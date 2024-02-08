import {
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { faCheckCircle as farCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faCheckCircle as fasCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import EffortEstimate from '../../shared/effort-estimate';
import messages from './messages';

const SequenceLink = ({
  id,
  intl,
  courseId,
  first,
  sequence,
  currentSequence,
}) => {
  const {
    complete,
    showLink,
    title,
  } = sequence;

  const coursewareUrl = <Link to={`/course/${courseId}/${id}`} className={sequence.id === currentSequence ? 'text-wrap font-weight-bold text-white' : 'text-dark'}>{title}</Link>;
  const displayTitle = showLink ? coursewareUrl : title;

  return (
    <li>
      <div className={`${sequence.id === currentSequence && 'bg-primary py-3'} ${first ? 'mt-0 mb-3' : 'mt-3'}`} style={{ borderRadius: '4rem' }}>
        <div className="d-flex x-small px-4 align-items-center">
          <div>
            {complete ? (
              <FontAwesomeIcon
                icon={fasCheckCircle}
                fixedWidth
                className="text-success"
                aria-hidden="true"
                title={intl.formatMessage(messages.completedAssignment)}
              />
            ) : (
              <FontAwesomeIcon
                icon={farCheckCircle}
                fixedWidth
                className="text-gray-400"
                aria-hidden="true"
                title={intl.formatMessage(messages.incompleteAssignment)}
              />
            )}
          </div>
          <div className="ml-2">
            <span>{displayTitle}</span>
            <span className="sr-only">
              , {intl.formatMessage(complete ? messages.completedAssignment : messages.incompleteAssignment)}
            </span>
            <EffortEstimate className="ml-2" block={sequence} />
          </div>
        </div>
      </div>
    </li>
  );
};

SequenceLink.propTypes = {
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  currentSequence: PropTypes.string.isRequired,
  first: PropTypes.bool.isRequired,
  sequence: PropTypes.shape().isRequired,
};

export default injectIntl(SequenceLink);
