import React from 'react'
import {TouchableWithoutFeedback, StyleSheet, View} from 'react-native'
import {observer} from 'mobx-react-lite'
import {useStores} from 'state/index'
import {usePalette} from 'lib/hooks/usePalette'
import type {Modal as ModalIface} from 'state/models/ui/shell'
import {isMobileWeb} from 'platform/detection'

import * as ConfirmModal from './Confirm'
import * as EditProfileModal from './EditProfile'
import * as ProfilePreviewModal from './ProfilePreview'
import * as ServerInputModal from './ServerInput'
import * as ReportModal from './report/Modal'
import * as CreateOrEditMuteListModal from './CreateOrEditMuteList'
import * as ListAddRemoveUserModal from './ListAddRemoveUser'
import * as DeleteAccountModal from './DeleteAccount'
import * as RepostModal from './Repost'
import * as SelfLabelModal from './SelfLabel'
import * as CropImageModal from './crop-image/CropImage.web'
import * as AltTextImageModal from './AltImage'
import * as EditImageModal from './EditImage'
import * as ChangeHandleModal from './ChangeHandle'
import * as WaitlistModal from './Waitlist'
import * as InviteCodesModal from './InviteCodes'
import * as AddAppPassword from './AddAppPasswords'
import * as ContentFilteringSettingsModal from './ContentFilteringSettings'
import * as ContentLanguagesSettingsModal from './lang-settings/ContentLanguagesSettings'
import * as PostLanguagesSettingsModal from './lang-settings/PostLanguagesSettings'
import * as ModerationDetailsModal from './ModerationDetails'

import * as TippingModal from './TippingModal.web'

export const ModalsContainer = observer(function ModalsContainer() {
  const store = useStores()

  if (!store.shell.isModalActive) {
    return null
  }

  return (
    <>
      {store.shell.activeModals.map((modal, i) => (
        <Modal key={`modal-${i}`} modal={modal} />
      ))}
    </>
  )
})

function Modal({modal}: {modal: ModalIface}) {
  const store = useStores()
  const pal = usePalette('default')

  if (!store.shell.isModalActive) {
    return null
  }

  const onPressMask = () => {
    if (modal.name === 'crop-image' || modal.name === 'edit-image') {
      return // dont close on mask presses during crop
    }
    store.shell.closeModal()
  }
  const onInnerPress = () => {
    // TODO: can we use prevent default?
    // do nothing, we just want to stop it from bubbling
  }

  let element
  if (modal.name === 'confirm') {
    element = <ConfirmModal.Component {...modal} />
  } else if (modal.name === 'edit-profile') {
    element = <EditProfileModal.Component {...modal} />
  } else if (modal.name === 'profile-preview') {
    element = <ProfilePreviewModal.Component {...modal} />
  } else if (modal.name === 'server-input') {
    element = <ServerInputModal.Component {...modal} />
  } else if (modal.name === 'report') {
    element = <ReportModal.Component {...modal} />
  } else if (modal.name === 'create-or-edit-mute-list') {
    element = <CreateOrEditMuteListModal.Component {...modal} />
  } else if (modal.name === 'list-add-remove-user') {
    element = <ListAddRemoveUserModal.Component {...modal} />
  } else if (modal.name === 'crop-image') {
    element = <CropImageModal.Component {...modal} />
  } else if (modal.name === 'delete-account') {
    element = <DeleteAccountModal.Component />
  } else if (modal.name === 'repost') {
    element = <RepostModal.Component {...modal} />
  } else if (modal.name === 'self-label') {
    element = <SelfLabelModal.Component {...modal} />
  } else if (modal.name === 'change-handle') {
    element = <ChangeHandleModal.Component {...modal} />
  } else if (modal.name === 'waitlist') {
    element = <WaitlistModal.Component />
  } else if (modal.name === 'invite-codes') {
    element = <InviteCodesModal.Component />
  } else if (modal.name === 'add-app-password') {
    element = <AddAppPassword.Component />
  } else if (modal.name === 'content-filtering-settings') {
    element = <ContentFilteringSettingsModal.Component />
  } else if (modal.name === 'content-languages-settings') {
    element = <ContentLanguagesSettingsModal.Component />
  } else if (modal.name === 'post-languages-settings') {
    element = <PostLanguagesSettingsModal.Component />
  } else if (modal.name === 'alt-text-image') {
    element = <AltTextImageModal.Component {...modal} />
  } else if (modal.name === 'edit-image') {
    element = <EditImageModal.Component {...modal} />
  } else if (modal.name === 'moderation-details') {
    element = <ModerationDetailsModal.Component {...modal} />
  } else if (modal.name === 'tip-modal') {
    element = <TippingModal.Component {...modal} />
  } else {
    return null
  }

  return (
    // eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors
    <TouchableWithoutFeedback onPress={onPressMask}>
      <View style={styles.mask}>
        {/* eslint-disable-next-line react-native-a11y/has-valid-accessibility-descriptors */}
        <TouchableWithoutFeedback onPress={onInnerPress}>
          <View
            style={[
              styles.container,
              isMobileWeb && styles.containerMobile,
              pal.view,
              pal.border,
            ]}>
            {element}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: 500,
    maxWidth: '100vw',
    maxHeight: '100vh',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  containerMobile: {
    borderRadius: 0,
    paddingHorizontal: 0,
  },
})
