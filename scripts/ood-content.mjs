/**
 * 面向对象设计方案内容
 * 源自 The System Design Primer 的 OOD 笔记本（Donne Martin, CC BY 4.0）。
 * 每个方案包含中英散文与 Python / Go / Java 三语言实现（CodeGroup Tab 展示）。
 */

export const oodContent = {
  'hash-map': {
    zh: {
      title: '设计哈希表',
      prose: `## 约束与假设

* 为了简化，键只使用整数可以吗？
    * 可以
* 解决冲突可以采用链地址法（chaining）吗？
    * 可以
* 需要处理负载因子（load factor）吗？
    * 不需要
* 可以假设输入都是合法的吗，还是需要校验？
    * 假设输入合法
* 可以假设数据能够全部放进内存吗？
    * 可以`,
    },
    en: {
      title: 'Design a Hash Map',
      prose: `## Constraints and assumptions

* For simplicity, are the keys integers only?
    * Yes
* For collision resolution, can we use chaining?
    * Yes
* Do we have to worry about load factors?
    * No
* Can we assume inputs are valid or do we have to validate them?
    * Assume they're valid
* Can we assume this fits memory?
    * Yes`,
    },
    code: {
      python: `class Item(object):

    def __init__(self, key, value):
        self.key = key
        self.value = value


class HashTable(object):

    def __init__(self, size):
        self.size = size
        self.table = [[] for _ in range(self.size)]

    def _hash_function(self, key):
        return key % self.size

    def set(self, key, value):
        hash_index = self._hash_function(key)
        for item in self.table[hash_index]:
            if item.key == key:
                item.value = value
                return
        self.table[hash_index].append(Item(key, value))

    def get(self, key):
        hash_index = self._hash_function(key)
        for item in self.table[hash_index]:
            if item.key == key:
                return item.value
        raise KeyError('Key not found')

    def remove(self, key):
        hash_index = self._hash_function(key)
        for index, item in enumerate(self.table[hash_index]):
            if item.key == key:
                del self.table[hash_index][index]
                return
        raise KeyError('Key not found')`,
      go: `package main

type Item struct {
    Key   int
    Value string
}

type HashTable struct {
    size  int
    table [][]Item
}

func NewHashTable(size int) *HashTable {
    return &HashTable{size: size, table: make([][]Item, size)}
}

func (h *HashTable) hash(key int) int {
    return key % h.size
}

func (h *HashTable) Set(key int, value string) {
    idx := h.hash(key)
    for i := range h.table[idx] {
        if h.table[idx][i].Key == key {
            h.table[idx][i].Value = value
            return
        }
    }
    h.table[idx] = append(h.table[idx], Item{Key: key, Value: value})
}

func (h *HashTable) Get(key int) (string, bool) {
    idx := h.hash(key)
    for _, item := range h.table[idx] {
        if item.Key == key {
            return item.Value, true
        }
    }
    return "", false
}

func (h *HashTable) Remove(key int) bool {
    idx := h.hash(key)
    for i, item := range h.table[idx] {
        if item.Key == key {
            h.table[idx] = append(h.table[idx][:i], h.table[idx][i+1:]...)
            return true
        }
    }
    return false
}`,
      java: `import java.util.LinkedList;

public class HashTable {

    private static class Item {
        int key;
        String value;

        Item(int key, String value) {
            this.key = key;
            this.value = value;
        }
    }

    private final int size;
    private final LinkedList<Item>[] table;

    @SuppressWarnings("unchecked")
    public HashTable(int size) {
        this.size = size;
        this.table = new LinkedList[size];
        for (int i = 0; i < size; i++) {
            this.table[i] = new LinkedList<>();
        }
    }

    private int hash(int key) {
        return key % size;
    }

    public void set(int key, String value) {
        int idx = hash(key);
        for (Item item : table[idx]) {
            if (item.key == key) {
                item.value = value;
                return;
            }
        }
        table[idx].add(new Item(key, value));
    }

    public String get(int key) {
        int idx = hash(key);
        for (Item item : table[idx]) {
            if (item.key == key) {
                return item.value;
            }
        }
        throw new IllegalArgumentException("Key not found");
    }

    public void remove(int key) {
        int idx = hash(key);
        for (Item item : table[idx]) {
            if (item.key == key) {
                table[idx].remove(item);
                return;
            }
        }
        throw new IllegalArgumentException("Key not found");
    }
}`,
    },
  },

  'lru-cache': {
    zh: {
      title: '设计 LRU 缓存',
      prose: `## 约束与假设

* 我们缓存的是什么？
    * 我们缓存的是网页查询的结果
* 可以假设输入都是合法的吗，还是需要校验？
    * 假设输入合法
* 可以假设数据能够全部放进内存吗？
    * 可以`,
    },
    en: {
      title: 'Design an LRU Cache',
      prose: `## Constraints and assumptions

* What are we caching?
    * We are caching the results of web queries
* Can we assume inputs are valid or do we have to validate them?
    * Assume they're valid
* Can we assume this fits memory?
    * Yes`,
    },
    code: {
      python: `class Node(object):

    def __init__(self, query, results):
        self.query = query
        self.results = results
        self.prev = None
        self.next = None


class LinkedList(object):

    def __init__(self):
        self.head = None
        self.tail = None

    def move_to_front(self, node):
        if node is self.head:
            return
        self._remove(node)
        self._append_to_front(node)

    def append_to_front(self, node):
        self._append_to_front(node)

    def remove_from_tail(self):
        if self.tail is None:
            return None
        node = self.tail
        self._remove(node)
        return node

    def _append_to_front(self, node):
        node.prev = None
        node.next = self.head
        if self.head is not None:
            self.head.prev = node
        self.head = node
        if self.tail is None:
            self.tail = node

    def _remove(self, node):
        if node.prev is not None:
            node.prev.next = node.next
        else:
            self.head = node.next
        if node.next is not None:
            node.next.prev = node.prev
        else:
            self.tail = node.prev
        node.prev = None
        node.next = None


class Cache(object):

    def __init__(self, max_size):
        self.max_size = max_size
        self.size = 0
        self.lookup = {}
        self.linked_list = LinkedList()

    def get(self, query):
        node = self.lookup.get(query)
        if node is None:
            return None
        self.linked_list.move_to_front(node)
        return node.results

    def set(self, query, results):
        node = self.lookup.get(query)
        if node is not None:
            node.results = results
            self.linked_list.move_to_front(node)
        else:
            if self.size == self.max_size:
                tail = self.linked_list.remove_from_tail()
                self.lookup.pop(tail.query, None)
            else:
                self.size += 1
            new_node = Node(query, results)
            self.linked_list.append_to_front(new_node)
            self.lookup[query] = new_node`,
      go: `package main

type Node struct {
    query   string
    results string
    prev    *Node
    next    *Node
}

type LinkedList struct {
    head *Node
    tail *Node
}

func (l *LinkedList) moveToFront(n *Node) {
    if n == l.head {
        return
    }
    l.remove(n)
    l.appendToFront(n)
}

func (l *LinkedList) appendToFront(n *Node) {
    n.prev = nil
    n.next = l.head
    if l.head != nil {
        l.head.prev = n
    }
    l.head = n
    if l.tail == nil {
        l.tail = n
    }
}

func (l *LinkedList) removeFromTail() *Node {
    if l.tail == nil {
        return nil
    }
    n := l.tail
    l.remove(n)
    return n
}

func (l *LinkedList) remove(n *Node) {
    if n.prev != nil {
        n.prev.next = n.next
    } else {
        l.head = n.next
    }
    if n.next != nil {
        n.next.prev = n.prev
    } else {
        l.tail = n.prev
    }
    n.prev = nil
    n.next = nil
}

type Cache struct {
    maxSize    int
    size       int
    lookup     map[string]*Node
    linkedList *LinkedList
}

func NewCache(maxSize int) *Cache {
    return &Cache{
        maxSize:    maxSize,
        lookup:     make(map[string]*Node),
        linkedList: &LinkedList{},
    }
}

func (c *Cache) Get(query string) (string, bool) {
    n := c.lookup[query]
    if n == nil {
        return "", false
    }
    c.linkedList.moveToFront(n)
    return n.results, true
}

func (c *Cache) Set(query, results string) {
    n := c.lookup[query]
    if n != nil {
        n.results = results
        c.linkedList.moveToFront(n)
        return
    }
    if c.size == c.maxSize {
        tail := c.linkedList.removeFromTail()
        delete(c.lookup, tail.query)
    } else {
        c.size++
    }
    newNode := &Node{query: query, results: results}
    c.linkedList.appendToFront(newNode)
    c.lookup[query] = newNode
}`,
      java: `import java.util.HashMap;
import java.util.Map;

public class LRUCache {

    private static class Node {
        String query;
        String results;
        Node prev;
        Node next;

        Node(String query, String results) {
            this.query = query;
            this.results = results;
        }
    }

    private static class LinkedList {
        Node head;
        Node tail;

        void moveToFront(Node n) {
            if (n == head) return;
            remove(n);
            appendToFront(n);
        }

        void appendToFront(Node n) {
            n.prev = null;
            n.next = head;
            if (head != null) head.prev = n;
            head = n;
            if (tail == null) tail = n;
        }

        Node removeFromTail() {
            if (tail == null) return null;
            Node n = tail;
            remove(n);
            return n;
        }

        void remove(Node n) {
            if (n.prev != null) n.prev.next = n.next;
            else head = n.next;
            if (n.next != null) n.next.prev = n.prev;
            else tail = n.prev;
            n.prev = null;
            n.next = null;
        }
    }

    private final int maxSize;
    private int size;
    private final Map<String, Node> lookup = new HashMap<>();
    private final LinkedList list = new LinkedList();

    public LRUCache(int maxSize) {
        this.maxSize = maxSize;
    }

    public String get(String query) {
        Node n = lookup.get(query);
        if (n == null) return null;
        list.moveToFront(n);
        return n.results;
    }

    public void set(String query, String results) {
        Node n = lookup.get(query);
        if (n != null) {
            n.results = results;
            list.moveToFront(n);
            return;
        }
        if (size == maxSize) {
            Node tail = list.removeFromTail();
            lookup.remove(tail.query);
        } else {
            size++;
        }
        Node newNode = new Node(query, results);
        list.appendToFront(newNode);
        lookup.put(query, newNode);
    }
}`,
    },
  },

  'call-center': {
    zh: {
      title: '设计呼叫中心',
      prose: `## 约束与假设

* 呼叫中心里有哪些级别的员工？
    * 接线员（Operator）、主管（Supervisor）、总监（Director）
* 可以假设来电总是先由接线员接听吗？
    * 可以
* 如果接线员都忙或无法处理，来电会转给主管吗？
    * 会
* 如果主管都忙或无法处理，来电会转给总监吗？
    * 会
* 可以假设总监能处理所有来电吗？
    * 可以
* 如果没人能接听来电，会怎样？
    * 来电进入队列等待
* 需要处理"VIP"来电（插队）吗？
    * 不需要
* 可以假设输入都是合法的吗，还是需要校验？
    * 假设输入合法`,
    },
    en: {
      title: 'Design a Call Center',
      prose: `## Constraints and assumptions

* What levels of employees are in the call center?
    * Operator, supervisor, director
* Can we assume operators always get the initial calls?
    * Yes
* If there is no available operator or the operator can't handle the call, does the call go to the supervisors?
    * Yes
* If there is no available supervisor or the supervisor can't handle the call, does the call go to the directors?
    * Yes
* Can we assume the directors can handle all calls?
    * Yes
* What happens if nobody can answer the call?
    * It gets queued
* Do we need to handle 'VIP' calls where we put someone to the front of the line?
    * No
* Can we assume inputs are valid or do we have to validate them?
    * Assume they're valid`,
    },
    code: {
      python: `from abc import ABCMeta, abstractmethod
from collections import deque
from enum import Enum


class Rank(Enum):
    OPERATOR = 0
    SUPERVISOR = 1
    DIRECTOR = 2


class CallState(Enum):
    READY = 0
    IN_PROGRESS = 1
    COMPLETE = 2


class Employee(metaclass=ABCMeta):

    def __init__(self, employee_id, name, rank, call_center):
        self.employee_id = employee_id
        self.name = name
        self.rank = rank
        self.call = None
        self.call_center = call_center

    def take_call(self, call):
        self.call = call
        self.call.employee = self
        self.call.state = CallState.IN_PROGRESS

    def complete_call(self):
        self.call.state = CallState.COMPLETE
        self.call_center.notify_call_completed(self.call)

    @abstractmethod
    def escalate_call(self):
        pass

    def _escalate_call(self):
        self.call.state = CallState.READY
        call = self.call
        self.call = None
        self.call_center.notify_call_escalated(call)


class Operator(Employee):

    def __init__(self, employee_id, name, call_center):
        super(Operator, self).__init__(employee_id, name, Rank.OPERATOR, call_center)

    def escalate_call(self):
        self.call.rank = Rank.SUPERVISOR
        self._escalate_call()


class Supervisor(Employee):

    def __init__(self, employee_id, name, call_center):
        super(Supervisor, self).__init__(employee_id, name, Rank.SUPERVISOR, call_center)

    def escalate_call(self):
        self.call.rank = Rank.DIRECTOR
        self._escalate_call()


class Director(Employee):

    def __init__(self, employee_id, name, call_center):
        super(Director, self).__init__(employee_id, name, Rank.DIRECTOR, call_center)

    def escalate_call(self):
        raise NotImplementedError('Directors must be able to handle any call')


class Call(object):

    def __init__(self, rank):
        self.state = CallState.READY
        self.rank = rank
        self.employee = None


class CallCenter(object):

    def __init__(self, operators, supervisors, directors):
        self.operators = operators
        self.supervisors = supervisors
        self.directors = directors
        self.queued_calls = deque()

    def dispatch_call(self, call):
        employee = self._dispatch_call(call, self.operators)
        if employee is None:
            employee = self._dispatch_call(call, self.supervisors)
        if employee is None:
            employee = self._dispatch_call(call, self.directors)
        if employee is None:
            self.queued_calls.append(call)

    def _dispatch_call(self, call, employees):
        for employee in employees:
            if employee.call is None:
                employee.take_call(call)
                return employee
        return None

    def notify_call_escalated(self, call):
        self.dispatch_call(call)

    def notify_call_completed(self, call):
        pass`,
      go: `package main

type Rank int

const (
    OperatorRank Rank = iota
    SupervisorRank
    DirectorRank
)

type CallState int

const (
    Ready CallState = iota
    InProgress
    Complete
)

type Call struct {
    State    CallState
    Rank     Rank
    Employee *Employee
}

type Employee struct {
    EmployeeID int
    Name       string
    Rank       Rank
    Call       *Call
    Center     *CallCenter
}

func (e *Employee) TakeCall(call *Call) {
    e.Call = call
    call.Employee = e
    call.State = InProgress
}

func (e *Employee) CompleteCall() {
    e.Call.State = Complete
    e.Center.NotifyCallCompleted(e.Call)
}

func (e *Employee) EscalateCall() {
    switch e.Rank {
    case OperatorRank:
        e.Call.Rank = SupervisorRank
    case SupervisorRank:
        e.Call.Rank = DirectorRank
    }
    e.Call.State = Ready
    call := e.Call
    e.Call = nil
    e.Center.NotifyCallEscalated(call)
}

type CallCenter struct {
    Operators   []*Employee
    Supervisors []*Employee
    Directors   []*Employee
    QueuedCalls []*Call
}

func (c *CallCenter) DispatchCall(call *Call) {
    emp := c.dispatch(call, c.Operators)
    if emp == nil {
        emp = c.dispatch(call, c.Supervisors)
    }
    if emp == nil {
        emp = c.dispatch(call, c.Directors)
    }
    if emp == nil {
        c.QueuedCalls = append(c.QueuedCalls, call)
    }
}

func (c *CallCenter) dispatch(call *Call, employees []*Employee) *Employee {
    for _, e := range employees {
        if e.Call == nil {
            e.TakeCall(call)
            return e
        }
    }
    return nil
}

func (c *CallCenter) NotifyCallEscalated(call *Call) { c.DispatchCall(call) }
func (c *CallCenter) NotifyCallCompleted(call *Call) {}`,
      java: `import java.util.ArrayDeque;
import java.util.Queue;

public class CallCenter {

    enum Rank { OPERATOR, SUPERVISOR, DIRECTOR }
    enum CallState { READY, IN_PROGRESS, COMPLETE }

    static class Call {
        CallState state = CallState.READY;
        Rank rank;
        Employee employee;

        Call(Rank rank) {
            this.rank = rank;
        }
    }

    static class Employee {
        final int employeeId;
        final String name;
        final Rank rank;
        final CallCenter center;
        Call call;

        Employee(int employeeId, String name, Rank rank, CallCenter center) {
            this.employeeId = employeeId;
            this.name = name;
            this.rank = rank;
            this.center = center;
        }

        void takeCall(Call call) {
            this.call = call;
            call.employee = this;
            call.state = CallState.IN_PROGRESS;
        }

        void completeCall() {
            call.state = CallState.COMPLETE;
            center.notifyCallCompleted(call);
        }

        void escalateCall() {
            switch (rank) {
                case OPERATOR: call.rank = Rank.SUPERVISOR; break;
                case SUPERVISOR: call.rank = Rank.DIRECTOR; break;
                default: throw new UnsupportedOperationException();
            }
            call.state = CallState.READY;
            Call c = call;
            call = null;
            center.notifyCallEscalated(c);
        }
    }

    final Queue<Employee> operators = new ArrayDeque<>();
    final Queue<Employee> supervisors = new ArrayDeque<>();
    final Queue<Employee> directors = new ArrayDeque<>();
    final Queue<Call> queuedCalls = new ArrayDeque<>();

    public void dispatchCall(Call call) {
        Employee emp = dispatch(call, operators);
        if (emp == null) emp = dispatch(call, supervisors);
        if (emp == null) emp = dispatch(call, directors);
        if (emp == null) queuedCalls.add(call);
    }

    private Employee dispatch(Call call, Queue<Employee> pool) {
        for (Employee e : pool) {
            if (e.call == null) {
                e.takeCall(call);
                return e;
            }
        }
        return null;
    }

    void notifyCallEscalated(Call call) { dispatchCall(call); }
    void notifyCallCompleted(Call call) {}
}`,
    },
  },

  'deck-of-cards': {
    zh: {
      title: '设计一副牌',
      prose: `## 约束与假设

* 这是一副用于扑克、二十一点等游戏的通用牌组吗？
    * 是的，先设计通用牌组，再扩展出二十一点（Black Jack）
* 可以假设牌组有 52 张牌（2-10、J、Q、K、A）和 4 种花色吗？
    * 可以
* 可以假设输入都是合法的吗，还是需要校验？
    * 假设输入合法`,
    },
    en: {
      title: 'Design a Deck of Cards',
      prose: `## Constraints and assumptions

* Is this a generic deck of cards for games like poker and black jack?
    * Yes, design a generic deck then extend it to black jack
* Can we assume the deck has 52 cards (2-10, Jack, Queen, King, Ace) and 4 suits?
    * Yes
* Can we assume inputs are valid or do we have to validate them?
    * Assume they're valid`,
    },
    code: {
      python: `from abc import ABCMeta, abstractmethod
from enum import Enum
import random


class Suit(Enum):
    HEART = 0
    DIAMOND = 1
    CLUBS = 2
    SPADE = 3


class Card(metaclass=ABCMeta):

    def __init__(self, value, suit):
        self.value = value
        self.suit = suit
        self.is_available = True

    @property
    @abstractmethod
    def value(self):
        pass


class BlackJackCard(Card):

    def __init__(self, value, suit):
        super(BlackJackCard, self).__init__(value, suit)
        self._value = value

    @property
    def value(self):
        if self.is_ace():
            return 1
        elif self.is_face_card():
            return 10
        else:
            return self._value

    @value.setter
    def value(self, new_value):
        if 1 <= new_value <= 13:
            self._value = new_value
        else:
            raise ValueError('Invalid card value: {}'.format(new_value))

    def is_ace(self):
        return self._value == 1

    def is_face_card(self):
        return 10 < self._value <= 13


class Hand(object):

    def __init__(self, cards):
        self.cards = cards

    def add_card(self, card):
        self.cards.append(card)

    def score(self):
        total = 0
        for card in self.cards:
            total += card.value
        return total


class BlackJackHand(Hand):

    BLACKJACK = 21

    def score(self):
        scores = self.possible_scores()
        max_under = max([s for s in scores if s <= self.BLACKJACK], default=-1)
        if max_under != -1:
            return max_under
        return min(scores)

    def possible_scores(self):
        aces = [c for c in self.cards if c.is_ace()]
        base = sum(c.value for c in self.cards if not c.is_ace())
        scores = [base]
        for _ in aces:
            scores = [s + 1 for s in scores] + [s + 11 for s in scores]
        return scores


class Deck(object):

    def __init__(self):
        self.cards = []
        self.deal_index = 0
        self._init_cards()

    def _init_cards(self):
        for suit in Suit:
            for value in range(1, 14):
                self.cards.append(BlackJackCard(value, suit))

    def remaining_cards(self):
        return len(self.cards) - self.deal_index

    def deal_card(self):
        if self.remaining_cards() == 0:
            return None
        card = self.cards[self.deal_index]
        card.is_available = False
        self.deal_index += 1
        return card

    def shuffle(self):
        random.shuffle(self.cards)`,
      go: `package main

import "math/rand"

type Suit int

const (
    Heart Suit = iota
    Diamond
    Clubs
    Spade
)

type BlackJackCard struct {
    value       int
    suit        Suit
    isAvailable bool
}

func NewBlackJackCard(value int, suit Suit) *BlackJackCard {
    return &BlackJackCard{value: value, suit: suit, isAvailable: true}
}

func (c *BlackJackCard) IsAce() bool {
    return c.value == 1
}

func (c *BlackJackCard) IsFaceCard() bool {
    return c.value > 10 && c.value <= 13
}

func (c *BlackJackCard) Value() int {
    if c.IsAce() {
        return 1
    }
    if c.IsFaceCard() {
        return 10
    }
    return c.value
}

type Hand struct {
    cards []*BlackJackCard
}

func (h *Hand) AddCard(c *BlackJackCard) {
    h.cards = append(h.cards, c)
}

type BlackJackHand struct {
    Hand
}

func (h *BlackJackHand) Score() int {
    scores := h.possibleScores()
    maxUnder := -1
    for _, s := range scores {
        if s <= 21 && s > maxUnder {
            maxUnder = s
        }
    }
    if maxUnder != -1 {
        return maxUnder
    }
    min := scores[0]
    for _, s := range scores[1:] {
        if s < min {
            min = s
        }
    }
    return min
}

func (h *BlackJackHand) possibleScores() []int {
    aces := 0
    base := 0
    for _, c := range h.cards {
        if c.IsAce() {
            aces++
        } else {
            base += c.Value()
        }
    }
    scores := []int{base}
    for i := 0; i < aces; i++ {
        next := make([]int, 0, len(scores)*2)
        for _, s := range scores {
            next = append(next, s+1, s+11)
        }
        scores = next
    }
    return scores
}

type Deck struct {
    cards     []*BlackJackCard
    dealIndex int
}

func NewDeck() *Deck {
    d := &Deck{}
    for suit := Heart; suit <= Spade; suit++ {
        for value := 1; value <= 13; value++ {
            d.cards = append(d.cards, NewBlackJackCard(value, suit))
        }
    }
    return d
}

func (d *Deck) RemainingCards() int {
    return len(d.cards) - d.dealIndex
}

func (d *Deck) DealCard() *BlackJackCard {
    if d.RemainingCards() == 0 {
        return nil
    }
    card := d.cards[d.dealIndex]
    card.isAvailable = false
    d.dealIndex++
    return card
}

func (d *Deck) Shuffle() {
    rand.Shuffle(len(d.cards), func(i, j int) {
        d.cards[i], d.cards[j] = d.cards[j], d.cards[i]
    })
}`,
      java: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DeckOfCards {

    enum Suit { HEART, DIAMOND, CLUBS, SPADE }

    static class Card {
        final int value;
        final Suit suit;
        boolean isAvailable = true;

        Card(int value, Suit suit) {
            this.value = value;
            this.suit = suit;
        }
    }

    static class BlackJackCard extends Card {
        BlackJackCard(int value, Suit suit) {
            super(value, suit);
        }

        boolean isAce() { return value == 1; }

        boolean isFaceCard() { return value > 10 && value <= 13; }

        int blackJackValue() {
            if (isAce()) return 1;
            if (isFaceCard()) return 10;
            return value;
        }
    }

    static class Hand {
        final List<BlackJackCard> cards = new ArrayList<>();

        void addCard(BlackJackCard card) { cards.add(card); }

        int score() {
            int total = 0;
            for (BlackJackCard c : cards) total += c.blackJackValue();
            return total;
        }
    }

    static class BlackJackHand extends Hand {
        static final int BLACKJACK = 21;

        @Override
        int score() {
            List<Integer> scores = possibleScores();
            int maxUnder = -1;
            for (int s : scores) {
                if (s <= BLACKJACK && s > maxUnder) maxUnder = s;
            }
            if (maxUnder != -1) return maxUnder;
            int min = scores.get(0);
            for (int s : scores) if (s < min) min = s;
            return min;
        }

        List<Integer> possibleScores() {
            int aces = 0, base = 0;
            for (BlackJackCard c : cards) {
                if (c.isAce()) aces++;
                else base += c.blackJackValue();
            }
            List<Integer> scores = new ArrayList<>();
            scores.add(base);
            for (int i = 0; i < aces; i++) {
                List<Integer> next = new ArrayList<>();
                for (int s : scores) {
                    next.add(s + 1);
                    next.add(s + 11);
                }
                scores = next;
            }
            return scores;
        }
    }

    static class Deck {
        final List<BlackJackCard> cards = new ArrayList<>();
        int dealIndex = 0;

        Deck() {
            for (Suit suit : Suit.values())
                for (int value = 1; value <= 13; value++)
                    cards.add(new BlackJackCard(value, suit));
        }

        int remainingCards() { return cards.size() - dealIndex; }

        BlackJackCard dealCard() {
            if (remainingCards() == 0) return null;
            BlackJackCard card = cards.get(dealIndex);
            card.isAvailable = false;
            dealIndex++;
            return card;
        }

        void shuffle() { Collections.shuffle(cards); }
    }
}`,
    },
  },

  'online-chat': {
    zh: {
      title: '设计在线聊天',
      prose: `## 约束与假设

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
* 暂不考虑扩展性`,
    },
    en: {
      title: 'Design an Online Chat',
      prose: `## Constraints and assumptions

* Assume we'll focus on the following workflows:
    * Text conversations only
    * Users
        * Add a user
        * Remove a user
        * Update a user
        * Add to a user's friends list
            * Add friend request
                * Approve friend request
                * Reject friend request
        * Remove from a user's friends list
    * Create a group chat
        * Invite friends to a group chat
        * Post a message to a group chat
    * Private 1-1 chat
        * Invite a friend to a private chat
        * Post a message to a private chat
* No need to worry about scaling initially`,
    },
    code: {
      python: `from abc import ABCMeta
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
        self.request_status = request_status`,
      go: `package main

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
}`,
      java: `import java.util.HashMap;
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
}`,
    },
  },

  'parking-lot': {
    zh: {
      title: '设计停车场',
      prose: `## 约束与假设

* 需要支持哪些类型的车辆？
    * 摩托车（Motorcycle）、汽车（Car）、巴士（Bus）
* 每种车辆占用的车位数量不同吗？
    * 是的
    * 摩托车位 → 摩托车
    * 紧凑车位 → 摩托车、汽车
    * 大型车位 → 摩托车、汽车
    * 巴士需要 5 个连续的"大型"车位
* 停车场有多层吗？
    * 有`,
    },
    en: {
      title: 'Design a Parking Lot',
      prose: `## Constraints and assumptions

* What types of vehicles should we support?
    * Motorcycle, Car, Bus
* Does each vehicle type take up a different amount of parking spots?
    * Yes
    * Motorcycle spot -> Motorcycle
    * Compact spot -> Motorcycle, Car
    * Large spot -> Motorcycle, Car
    * Bus can park if we have 5 consecutive "large" spots
* Does the parking lot have multiple levels?
    * Yes`,
    },
    code: {
      python: `from abc import ABCMeta, abstractmethod
from enum import Enum


class VehicleSize(Enum):
    MOTORCYCLE = 0
    COMPACT = 1
    LARGE = 2


class Vehicle(metaclass=ABCMeta):

    def __init__(self, vehicle_size, license_plate, spot_size):
        self.vehicle_size = vehicle_size
        self.license_plate = license_plate
        self.spot_size = spot_size
        self.spots_taken = []

    def clear_spots(self):
        for spot in self.spots_taken:
            spot.remove_vehicle()
        self.spots_taken = []

    def take_spot(self, spot):
        self.spots_taken.append(spot)

    @abstractmethod
    def can_fit_in_spot(self, spot):
        pass


class Motorcycle(Vehicle):

    def __init__(self, license_plate):
        super(Motorcycle, self).__init__(VehicleSize.MOTORCYCLE, license_plate, spot_size=1)

    def can_fit_in_spot(self, spot):
        return True


class Car(Vehicle):

    def __init__(self, license_plate):
        super(Car, self).__init__(VehicleSize.COMPACT, license_plate, spot_size=1)

    def can_fit_in_spot(self, spot):
        return spot.size in (VehicleSize.LARGE, VehicleSize.COMPACT)


class Bus(Vehicle):

    def __init__(self, license_plate):
        super(Bus, self).__init__(VehicleSize.LARGE, license_plate, spot_size=5)

    def can_fit_in_spot(self, spot):
        return spot.size == VehicleSize.LARGE


class ParkingLot(object):

    def __init__(self, num_levels, num_spots_per_level):
        self.num_levels = num_levels
        self.levels = [Level(floor, num_spots_per_level) for floor in range(num_levels)]

    def park_vehicle(self, vehicle):
        for level in self.levels:
            if level.park_vehicle(vehicle):
                return True
        return False


class Level(object):

    def __init__(self, floor, total_spots):
        self.floor = floor
        self.num_spots = total_spots
        self.available_spots = total_spots
        self.parking_spots = [ParkingSpot(floor, i, VehicleSize.LARGE) for i in range(total_spots)]

    def park_vehicle(self, vehicle):
        for i in range(self.num_spots):
            if self._fits(vehicle, i):
                return self._park_starting_at_spot(vehicle, i)
        return None

    def _fits(self, vehicle, start_index):
        if start_index + vehicle.spot_size > self.num_spots:
            return False
        for j in range(start_index, start_index + vehicle.spot_size):
            if not self.parking_spots[j].can_fit_vehicle(vehicle):
                return False
        return True

    def _park_starting_at_spot(self, vehicle, start_index):
        for j in range(start_index, start_index + vehicle.spot_size):
            spot = self.parking_spots[j]
            spot.park_vehicle(vehicle)
            vehicle.take_spot(spot)
            self.available_spots -= 1
        return self.parking_spots[start_index]

    def spot_freed(self):
        self.available_spots += 1


class ParkingSpot(object):

    def __init__(self, level, spot_number, spot_size):
        self.level = level
        self.spot_number = spot_number
        self.spot_size = spot_size
        self.vehicle = None

    def is_available(self):
        return self.vehicle is None

    def can_fit_vehicle(self, vehicle):
        return self.is_available() and vehicle.can_fit_in_spot(self)

    def park_vehicle(self, vehicle):
        self.vehicle = vehicle

    def remove_vehicle(self):
        self.vehicle = None`,
      go: `package main

type VehicleSize int

const (
    Motorcycle VehicleSize = iota
    Compact
    Large
)

type Vehicle interface {
    SpotSize() int
    CanFitInSpot(spot *ParkingSpot) bool
    TakeSpot(spot *ParkingSpot)
    ClearSpots()
}

type BaseVehicle struct {
    size         VehicleSize
    licensePlate string
    spotSize     int
    spotsTaken   []*ParkingSpot
}

func (v *BaseVehicle) SpotSize() int { return v.spotSize }

func (v *BaseVehicle) TakeSpot(spot *ParkingSpot) {
    v.spotsTaken = append(v.spotsTaken, spot)
}

func (v *BaseVehicle) ClearSpots() {
    for _, spot := range v.spotsTaken {
        spot.RemoveVehicle()
    }
    v.spotsTaken = nil
}

type MotorcycleVehicle struct{ BaseVehicle }

func NewMotorcycle(license string) *MotorcycleVehicle {
    return &MotorcycleVehicle{BaseVehicle{size: Motorcycle, licensePlate: license, spotSize: 1}}
}

func (m *MotorcycleVehicle) CanFitInSpot(spot *ParkingSpot) bool { return true }

type CarVehicle struct{ BaseVehicle }

func NewCar(license string) *CarVehicle {
    return &CarVehicle{BaseVehicle{size: Compact, licensePlate: license, spotSize: 1}}
}

func (c *CarVehicle) CanFitInSpot(spot *ParkingSpot) bool {
    return spot.size == Large || spot.size == Compact
}

type BusVehicle struct{ BaseVehicle }

func NewBus(license string) *BusVehicle {
    return &BusVehicle{BaseVehicle{size: Large, licensePlate: license, spotSize: 5}}
}

func (b *BusVehicle) CanFitInSpot(spot *ParkingSpot) bool {
    return spot.size == Large
}

type ParkingLot struct {
    levels []*Level
}

func NewParkingLot(numLevels, spotsPerLevel int) *ParkingLot {
    lot := &ParkingLot{}
    for f := 0; f < numLevels; f++ {
        lot.levels = append(lot.levels, NewLevel(f, spotsPerLevel))
    }
    return lot
}

func (l *ParkingLot) ParkVehicle(v Vehicle) bool {
    for _, level := range l.levels {
        if level.ParkVehicle(v) != nil {
            return true
        }
    }
    return false
}

type Level struct {
    floor          int
    availableSpots int
    parkingSpots   []*ParkingSpot
}

func NewLevel(floor, totalSpots int) *Level {
    l := &Level{floor: floor, availableSpots: totalSpots}
    for i := 0; i < totalSpots; i++ {
        l.parkingSpots = append(l.parkingSpots, &ParkingSpot{spotNumber: i, size: Large})
    }
    return l
}

func (l *Level) ParkVehicle(v Vehicle) *ParkingSpot {
    for i := range l.parkingSpots {
        if spot := l.parkStartingAt(v, i); spot != nil {
            return spot
        }
    }
    return nil
}

func (l *Level) parkStartingAt(v Vehicle, start int) *ParkingSpot {
    if start+v.SpotSize() > len(l.parkingSpots) {
        return nil
    }
    for j := start; j < start+v.SpotSize(); j++ {
        if !l.parkingSpots[j].CanFitVehicle(v) {
            return nil
        }
    }
    for j := start; j < start+v.SpotSize(); j++ {
        l.parkingSpots[j].ParkVehicle(v)
        v.TakeSpot(l.parkingSpots[j])
        l.availableSpots--
    }
    return l.parkingSpots[start]
}

func (l *Level) SpotFreed() { l.availableSpots++ }

type ParkingSpot struct {
    spotNumber int
    size       VehicleSize
    vehicle    Vehicle
}

func (s *ParkingSpot) CanFitVehicle(v Vehicle) bool {
    return s.vehicle == nil && v.CanFitInSpot(s)
}

func (s *ParkingSpot) ParkVehicle(v Vehicle) { s.vehicle = v }
func (s *ParkingSpot) RemoveVehicle()        { s.vehicle = nil }`,
      java: `import java.util.ArrayList;
import java.util.List;

public class ParkingLot {

    enum VehicleSize { MOTORCYCLE, COMPACT, LARGE }

    interface Vehicle {
        VehicleSize size();
        int spotSize();
        boolean canFitInSpot(ParkingSpot spot);
        void takeSpot(ParkingSpot spot);
        void clearSpots();
    }

    static abstract class BaseVehicle implements Vehicle {
        final VehicleSize size;
        final int spotSize;
        final List<ParkingSpot> spotsTaken = new ArrayList<>();

        BaseVehicle(VehicleSize size, int spotSize) {
            this.size = size;
            this.spotSize = spotSize;
        }

        public VehicleSize size() { return size; }
        public int spotSize() { return spotSize; }
        public void takeSpot(ParkingSpot spot) { spotsTaken.add(spot); }
        public void clearSpots() {
            for (ParkingSpot s : spotsTaken) s.removeVehicle();
            spotsTaken.clear();
        }
    }

    static class Motorcycle extends BaseVehicle {
        Motorcycle() { super(VehicleSize.MOTORCYCLE, 1); }
        public boolean canFitInSpot(ParkingSpot spot) { return true; }
    }

    static class Car extends BaseVehicle {
        Car() { super(VehicleSize.COMPACT, 1); }
        public boolean canFitInSpot(ParkingSpot spot) {
            return spot.size == VehicleSize.LARGE || spot.size == VehicleSize.COMPACT;
        }
    }

    static class Bus extends BaseVehicle {
        Bus() { super(VehicleSize.LARGE, 5); }
        public boolean canFitInSpot(ParkingSpot spot) {
            return spot.size == VehicleSize.LARGE;
        }
    }

    static class ParkingSpot {
        final int spotNumber;
        final VehicleSize size;
        Vehicle vehicle;

        ParkingSpot(int spotNumber, VehicleSize size) {
            this.spotNumber = spotNumber;
            this.size = size;
        }

        boolean canFitVehicle(Vehicle v) {
            return vehicle == null && v.canFitInSpot(this);
        }

        void parkVehicle(Vehicle v) { vehicle = v; }
        void removeVehicle() { vehicle = null; }
    }

    static class Level {
        int availableSpots;
        final List<ParkingSpot> spots = new ArrayList<>();

        Level(int totalSpots) {
            availableSpots = totalSpots;
            for (int i = 0; i < totalSpots; i++) {
                spots.add(new ParkingSpot(i, VehicleSize.LARGE));
            }
        }

        ParkingSpot parkVehicle(Vehicle v) {
            for (int i = 0; i < spots.size(); i++) {
                ParkingSpot s = parkStartingAt(v, i);
                if (s != null) return s;
            }
            return null;
        }

        private ParkingSpot parkStartingAt(Vehicle v, int start) {
            if (start + v.spotSize() > spots.size()) return null;
            for (int j = start; j < start + v.spotSize(); j++) {
                if (!spots.get(j).canFitVehicle(v)) return null;
            }
            for (int j = start; j < start + v.spotSize(); j++) {
                spots.get(j).parkVehicle(v);
                v.takeSpot(spots.get(j));
                availableSpots--;
            }
            return spots.get(start);
        }

        void spotFreed() { availableSpots++; }
    }

    private final List<Level> levels = new ArrayList<>();

    ParkingLot(int numLevels, int spotsPerLevel) {
        for (int i = 0; i < numLevels; i++) {
            levels.add(new Level(spotsPerLevel));
        }
    }

    boolean parkVehicle(Vehicle v) {
        for (Level level : levels) {
            if (level.parkVehicle(v) != null) return true;
        }
        return false;
    }
}`,
    },
  },
}
