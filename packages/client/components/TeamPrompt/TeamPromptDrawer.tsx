import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {TeamPromptDrawer_meeting$key} from '~/__generated__/TeamPromptDrawer_meeting.graphql'
import {desktopSidebarShadow} from '../../styles/elevation'
import {BezierCurve, Breakpoint, DiscussionThreadEnum, ZIndex} from '../../types/constEnums'
import ResponsiveDashSidebar from '../ResponsiveDashSidebar'
import TeamPromptDiscussionDrawer from './TeamPromptDiscussionDrawer'
import TeamPromptWorkDrawer from './TeamPromptWorkDrawer'
import useBreakpoint from '../../hooks/useBreakpoint'
import findStageById from '../../utils/meetings/findStageById'
import SendClientSideEvent from '../../mutations/SendClientSideEvent'

const Drawer = styled('div')<{isDesktop: boolean; isMobile: boolean; isOpen: boolean}>(
  ({isDesktop, isMobile, isOpen}) => ({
    boxShadow: isDesktop ? desktopSidebarShadow : undefined,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'stretch',
    overflow: 'hidden',
    position: isDesktop ? 'fixed' : 'static',
    bottom: 0,
    top: 0,
    right: isDesktop ? 0 : undefined,
    userSelect: isDesktop ? undefined : 'none',
    transition: `all 200ms ${BezierCurve.DECELERATE}`,
    transform: `translateX(${
      isOpen
        ? isMobile
          ? `calc(${DiscussionThreadEnum.WIDTH}px - 100vw)`
          : 0
        : `${DiscussionThreadEnum.WIDTH}px`
    })`,
    width: isMobile ? '100vw' : `min(${DiscussionThreadEnum.WIDTH}px, 100vw)`,
    zIndex: ZIndex.SIDEBAR,
    height: '100%',
    '@supports (height: 1svh) and (height: 1lvh)': {
      height: isDesktop ? '100lvh' : '100svh'
    }
  })
)

interface Props {
  meetingRef: TeamPromptDrawer_meeting$key
  isDesktop: boolean
}

const TeamPromptDrawer = ({meetingRef, isDesktop}: Props) => {
  const meeting = useFragment(
    graphql`
      fragment TeamPromptDrawer_meeting on TeamPromptMeeting {
        ...TeamPromptDiscussionDrawer_meeting
        ...TeamPromptWorkDrawer_meeting
        id
        teamId
        isRightDrawerOpen
        localStageId
        phases {
          stages {
            id
            ... on TeamPromptResponseStage {
              discussionId
              teamMember {
                id
              }
            }
          }
        }
      }
    `,
    meetingRef
  )

  const isMobile = !useBreakpoint(Breakpoint.FUZZY_TABLET)
  const atmosphere = useAtmosphere()
  const {id: meetingId, isRightDrawerOpen} = meeting

  const shouldRenderDiscussionDrawer = () => {
    const {localStageId} = meeting
    if (!localStageId) return false

    const stage = findStageById(meeting.phases, localStageId)
    if (!stage) return false

    const {discussionId, teamMember} = stage.stage
    if (!discussionId || !teamMember) return false

    return true
  }

  const onToggleDrawer = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      if (!meetingProxy) return
      const isRightDrawerOpen = meetingProxy.getValue('isRightDrawerOpen')

      if (!shouldRenderDiscussionDrawer()) {
        SendClientSideEvent(
          atmosphere,
          isRightDrawerOpen ? 'Your Work Drawer Closed' : 'Your Work Drawer Opened',
          {
            teamId: meeting.teamId,
            meetingId: meeting.id,
            source: 'drawer'
          }
        )
      }

      meetingProxy.setValue(!isRightDrawerOpen, 'isRightDrawerOpen')
    })
  }

  return (
    <ResponsiveDashSidebar
      isOpen={isRightDrawerOpen}
      isRightDrawer
      onToggle={onToggleDrawer}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <Drawer isDesktop={isDesktop} isMobile={isMobile} isOpen={isRightDrawerOpen}>
        {shouldRenderDiscussionDrawer() ? (
          <TeamPromptDiscussionDrawer meetingRef={meeting} onToggleDrawer={onToggleDrawer} />
        ) : (
          <TeamPromptWorkDrawer meetingRef={meeting} onToggleDrawer={onToggleDrawer} />
        )}
      </Drawer>
    </ResponsiveDashSidebar>
  )
}

export default TeamPromptDrawer
