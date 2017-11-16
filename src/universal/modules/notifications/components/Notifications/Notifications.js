import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import Atmosphere from 'universal/Atmosphere';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import {requiresAction} from 'universal/data/notification';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import NotificationRow from 'universal/modules/notifications/components/NotificationRow/NotificationRow';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import fromGlobalId from 'universal/utils/relay/fromGlobalId';
import withMutationProps from 'universal/utils/relay/withMutationProps';

const nop = () => {};

const Notifications = (props) => {
  const {
    atmosphere,
    dispatch,
    notifications,
    styles
  } = props;
  const paymentFake = {
    brand: 'Visa',
    last4: '5555',
    orgId: 'BkeCjMNHpZ'
  };

  const clearAllNotifications = () =>
    Promise.all(
      notifications.edges
        .map(({node: notification}) => notification)
        .filter((n) => !requiresAction(n))
        .map(({id}) => {
          console.log('clearing: ', id, fromGlobalId(id))
          ClearNotificationMutation(atmosphere, fromGlobalId(id).id, nop, nop)
        })
    );

  const clearAllButton = () =>
    (
      <div style={{alignSelf: 'center', marginRight: '-.25rem', minWidth: '5.75rem'}}>
        <Button
          aria-label="Clear all notifications"
          buttonSize="small"
          buttonStyle="flat"
          colorPalette="dark"
          icon="check"
          iconPlacement="right"
          isBlock
          label="Clear All"
          onClick={clearAllNotifications}
          title="Clear all notifications"
        />
      </div>
    );
  const hasClearAbleNotifs = true;
  return (
    <UserSettingsWrapper>
      <Helmet title="My Notifications | Parabol" />
      <div className={css(styles.wrapper)}>
        <Panel label="Notifications" controls={hasClearAbleNotifs && clearAllButton()}>
          {notifications && notifications.edges.length ?
            <div className={css(styles.notificationList)}>
              {notifications.edges.map(({node}) =>
                (<NotificationRow
                  dispatch={dispatch}
                  key={`notification${node.id}`}
                  notification={node}
                />)
              )}
            </div> :
            <div className={css(styles.notificationsEmpty)}>
              {'Hey there! You’re all caught up! 💯'}
            </div>
          }
        </Panel>
      </div>
    </UserSettingsWrapper>
  );
};

Notifications.propTypes = {
  atmosphere: PropTypes.instanceOf(Atmosphere),
  dispatch: PropTypes.func.isRequired,
  error: PropTypes.instanceOf(Error),
  notifications: PropTypes.object,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  styles: PropTypes.object,
  submitting: PropTypes.bool.isRequired,
  submitMutation: PropTypes.func.isRequired
};

const styleThunk = () => ({
  notificationList: {
    // Define
  },

  notificationsEmpty: {
    alignItems: 'center',
    borderTop: `1px solid ${ui.rowBorderColor}`,
    color: appTheme.palette.dark,
    display: 'flex',
    fontSize: appTheme.typography.s5,
    height: '4.8125rem',
    justifyContent: 'center',
    lineHeight: '1.5',
    padding: ui.rowGutter,
    textAlign: 'center',
    width: '100%'
  },

  wrapper: {
    maxWidth: '48rem'
  }
});

export default withAtmosphere(
  withMutationProps(
    withStyles(styleThunk)(Notifications)
  )
);
