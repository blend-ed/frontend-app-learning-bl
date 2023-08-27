import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import { faCheckCircle as fasCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle as farCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import EffortEstimate from '../../shared/effort-estimate';
import { useModel } from '../../generic/model-store';
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
    description,
    due,
    showLink,
    title,
  } = sequence;
  const {
    userTimezone,
  } = useModel('outline', courseId);

  const timezoneFormatArgs = userTimezone ? { timeZone: userTimezone } : {};

  const coursewareUrl = <Link to={`/course/${courseId}/${id}`} className="text-white">{title}</Link>;
  const displayTitle = showLink ? coursewareUrl : title;

  const dueDateMessage = (
    <FormattedMessage
      id="learning.outline.sequence-due-date-set"
      defaultMessage="{description} due {assignmentDue}"
      description="Used below an assignment title"
      values={{
        assignmentDue: (
          <FormattedTime
            key={`${id}-due`}
            day="numeric"
            month="short"
            year="numeric"
            timeZoneName="short"
            value={due}
            {...timezoneFormatArgs}
          />
        ),
        description: description || '',
      }}
    />
  );

  const noDueDateMessage = (
    <FormattedMessage
      id="learning.outline.sequence-due-date-not-set"
      defaultMessage="{description}"
      description="Used below an assignment title"
      values={{
        assignmentDue: (
          <FormattedTime
            key={`${id}-due`}
            day="numeric"
            month="short"
            year="numeric"
            timeZoneName="short"
            value={due}
            {...timezoneFormatArgs}
          />
        ),
        description: description || '',
      }}
    />
  );

  return (
    <li>
      <div className={classNames('', { 'mt-2 pt-1': !first })}>
        <div className="d-flex w-100 x-small px-2">
          <div className="">
            {complete ? (
              <FontAwesomeIcon
                icon={fasCheckCircle}
                fixedWidth
                className="float-left text-success mt-1"
                aria-hidden="true"
                title={intl.formatMessage(messages.completedAssignment)}
              />
            ) : (
              <FontAwesomeIcon
                icon={farCheckCircle}
                fixedWidth
                className="float-left text-gray-400 mt-1"
                aria-hidden="true"
                title={intl.formatMessage(messages.incompleteAssignment)}
              />
            )}
          </div>
          <div className="col-10 p-0 ml-3 text-break">
            <span className={`align-middle text-light ${sequence.id === currentSequence && 'h5'}`}>{displayTitle}</span>
            <span className="sr-only">
              , {intl.formatMessage(complete ? messages.completedAssignment : messages.incompleteAssignment)}
            </span>
            <EffortEstimate className="ml-3 align-middle" block={sequence} />
          </div>
        </div>
        <div className="row w-100 d-flex justify-content-center">
          <small className="text-primary-300">
            {due ? dueDateMessage : noDueDateMessage}
          </small>
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
