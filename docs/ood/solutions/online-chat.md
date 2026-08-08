# 设计在线聊天

> 源自《The System Design Primer》OOD 方案（Donne Martin, CC BY 4.0），代码提供 Python / Go / Java 三种实现。

## 约束与假设

* 假设我们只关注以下工作流：
    * 纯文本聊天
    * 用户
        * 添加用户
        * 删除用户
        * 更新用户
        * 添加好友（发送好友申请 → 接受 / 拒绝）
        * 删除好友
    * 创建群聊
        * 邀请好友进群
        * 在群里发消息
    * 一对一私聊
        * 邀请好友私聊
        * 发送私聊消息
* 暂不考虑扩展性

## 方案

::: code-group

```python [Python]
from abc import ABCMeta
from enum import Enum


class RequestStatus(Enum):
    UNREAD = 0
    READ = 1
    ACCEPTED = 2
    REJECTED = 3


class UserService(object):

    def __init__(self):
        self.users_by_id = {}

    def add_user(self, user_id, name, pass_hash):
        self.users_by_id[user_id] = User(user_id, name, pass_hash, self)

    def remove_user(self, user_id):
        self.users_by_id.pop(user_id, None)

    def send_friend_request(self, from_user_id, to_user_id):
        self.users_by_id[from_user_id].send_friend_request(to_user_id)

    def approve_friend_request(self, from_user_id, to_user_id):
        self.users_by_id[from_user_id].approve_friend_request(to_user_id)

    def reject_friend_request(self, from_user_id, to_user_id):
        self.users_by_id[from_user_id].reject_friend_request(to_user_id)


class User(object):

    def __init__(self, user_id, name, pass_hash, user_service):
        self.user_id = user_id
        self.name = name
        self.pass_hash = pass_hash
        self.user_service = user_service
        self.friends_by_id = {}
        self.friend_ids_to_private_chats = {}
        self.group_chats_by_id = {}
        self.received_friend_requests_by_friend_id = {}
        self.sent_friend_requests_by_friend_id = {}

    def message_user(self, friend_id, message):
        chat = self.friend_ids_to_private_chats[friend_id]
        chat.messages.append(message)

    def message_group(self, group_id, message):
        self.group_chats_by_id[group_id].messages.append(message)

    def send_friend_request(self, friend_id):
        self.sent_friend_requests_by_friend_id[friend_id] = AddRequest(
            self.user_id, friend_id, RequestStatus.UNREAD)
        self.user_service.users_by_id[friend_id].receive_friend_request(self.user_id)

    def receive_friend_request(self, friend_id):
        self.received_friend_requests_by_friend_id[friend_id] = AddRequest(
            friend_id, self.user_id, RequestStatus.UNREAD)

    def approve_friend_request(self, friend_id):
        request = self.received_friend_requests_by_friend_id.pop(friend_id, None)
        if request is None:
            return
        request.request_status = RequestStatus.ACCEPTED
        friend = self.user_service.users_by_id[friend_id]
        self.friends_by_id[friend_id] = friend
        self.friend_ids_to_private_chats[friend_id] = PrivateChat(self.user_id, friend_id)

    def reject_friend_request(self, friend_id):
        request = self.received_friend_requests_by_friend_id.pop(friend_id, None)
        if request is not None:
            request.request_status = RequestStatus.REJECTED


class Chat(object):

    def __init__(self, chat_id):
        self.chat_id = chat_id
        self.users = []
        self.messages = []


class PrivateChat(Chat):

    def __init__(self, first_user_id, second_user_id):
        super(PrivateChat, self).__init__(first_user_id + second_user_id)
        self.users.append(first_user_id)
        self.users.append(second_user_id)


class GroupChat(Chat):

    def add_user(self, user_id):
        self.users.append(user_id)

    def remove_user(self, user_id):
        self.users.remove(user_id)


class Message(object):

    def __init__(self, message_id, message, timestamp):
        self.message_id = message_id
        self.message = message
        self.timestamp = timestamp


class AddRequest(object):

    def __init__(self, from_user_id, to_user_id, request_status):
        self.from_user_id = from_user_id
        self.to_user_id = to_user_id
        self.request_status = request_status
```

```go [Go]
package main

type RequestStatus int

const (
    Unread RequestStatus = iota
    Read
    Accepted
    Rejected
)

type AddRequest struct {
    FromUserID int
    ToUserID   int
    Status     RequestStatus
}

type Message struct {
    MessageID int
    Body      string
}

type Chat struct {
    ID       int
    Users    []int
    Messages []*Message
}

func NewChat(id int) *Chat {
    return &Chat{ID: id}
}

func (c *Chat) PostMessage(m *Message) {
    c.Messages = append(c.Messages, m)
}

type GroupChat struct {
    Chat
}

type User struct {
    ID                     int
    Name                   string
    PassHash               string
    FriendsByID            map[int]*User
    PrivateChatsByFriendID map[int]*Chat
    GroupChatsByID         map[int]*GroupChat
    ReceivedRequests       map[int]*AddRequest
    Service                *UserService
}

func newUser(id int, name, passHash string, service *UserService) *User {
    return &User{
        ID:                     id,
        Name:                   name,
        PassHash:               passHash,
        FriendsByID:            map[int]*User{},
        PrivateChatsByFriendID: map[int]*Chat{},
        GroupChatsByID:         map[int]*GroupChat{},
        ReceivedRequests:       map[int]*AddRequest{},
        Service:                service,
    }
}

func (u *User) SendFriendRequest(friendID int) {
    friend := u.Service.UsersByID[friendID]
    friend.ReceivedRequests[u.ID] = &AddRequest{FromUserID: u.ID, ToUserID: friendID, Status: Unread}
}

func (u *User) ApproveFriendRequest(friendID int) {
    req, ok := u.ReceivedRequests[friendID]
    if !ok {
        return
    }
    req.Status = Accepted
    delete(u.ReceivedRequests, friendID)
    u.FriendsByID[friendID] = u.Service.UsersByID[friendID]
    u.PrivateChatsByFriendID[friendID] = NewChat(u.ID + friendID)
}

type UserService struct {
    UsersByID map[int]*User
}

func NewUserService() *UserService {
    return &UserService{UsersByID: map[int]*User{}}
}

func (s *UserService) AddUser(id int, name, passHash string) {
    s.UsersByID[id] = newUser(id, name, passHash, s)
}

func (s *UserService) RemoveUser(id int) {
    delete(s.UsersByID, id)
}
```

```java [Java]
import java.util.HashMap;
import java.util.Map;

public class OnlineChat {

    enum RequestStatus { UNREAD, READ, ACCEPTED, REJECTED }

    static class AddRequest {
        final int fromUserId, toUserId;
        RequestStatus status;

        AddRequest(int from, int to, RequestStatus status) {
            this.fromUserId = from;
            this.toUserId = to;
            this.status = status;
        }
    }

    static class Message {
        final int id;
        final String body;

        Message(int id, String body) {
            this.id = id;
            this.body = body;
        }
    }

    static class User {
        final int id;
        final String name;
        final UserService service;
        final Map<Integer, User> friends = new HashMap<>();
        final Map<Integer, AddRequest> receivedRequests = new HashMap<>();

        User(int id, String name, UserService service) {
            this.id = id;
            this.name = name;
            this.service = service;
        }

        void sendFriendRequest(int friendId) {
            User friend = service.users.get(friendId);
            friend.receivedRequests.put(id,
                    new AddRequest(id, friendId, RequestStatus.UNREAD));
        }

        void approveFriendRequest(int friendId) {
            AddRequest req = receivedRequests.remove(friendId);
            if (req != null) {
                req.status = RequestStatus.ACCEPTED;
                friends.put(friendId, service.users.get(friendId));
            }
        }
    }

    static class UserService {
        final Map<Integer, User> users = new HashMap<>();

        void addUser(int id, String name) {
            users.put(id, new User(id, name, this));
        }

        void removeUser(int id) {
            users.remove(id);
        }
    }
}
```

:::
