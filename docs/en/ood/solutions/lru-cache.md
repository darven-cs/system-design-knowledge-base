# Design an LRU Cache

> 源自《The System Design Primer》OOD 方案（Donne Martin, CC BY 4.0），代码提供 Python / Go / Java 三种实现。

## Constraints and assumptions

* What are we caching?
    * We are caching the results of web queries
* Can we assume inputs are valid or do we have to validate them?
    * Assume they're valid
* Can we assume this fits memory?
    * Yes

## Solution

::: code-group

```python [Python]
class Node(object):

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
            self.lookup[query] = new_node
```

```go [Go]
package main

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
}
```

```java [Java]
import java.util.HashMap;
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
}
```

:::
