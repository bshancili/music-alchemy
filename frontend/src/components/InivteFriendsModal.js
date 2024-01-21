import { Modal, Button, List, Avatar } from "@chakra-ui/react";

const InviteFriendsModal = ({ visible, friends, onCancel, onInvite }) => {
  return (
    <Modal
      visible={visible}
      title="Invite Friends"
      onCancel={onCancel}
      footer={null}
    >
      <List
        dataSource={friends}
        renderItem={(friend) => (
          <List.Item key={friend.uid}>
            <List.Item.Meta
              avatar={<Avatar src={friend.profile_picture_url} />}
              title={friend.username}
            />
            <Button onClick={() => onInvite(friend)}>Invite</Button>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default InviteFriendsModal;
