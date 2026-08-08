# Design a Hash Map

> 源自《The System Design Primer》OOD 方案（Donne Martin, CC BY 4.0），代码提供 Python / Go / Java 三种实现。

## Constraints and assumptions

* For simplicity, are the keys integers only?
    * Yes
* For collision resolution, can we use chaining?
    * Yes
* Do we have to worry about load factors?
    * No
* Can we assume inputs are valid or do we have to validate them?
    * Assume they're valid
* Can we assume this fits memory?
    * Yes

## Solution

::: code-group

```python [Python]
class Item(object):

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
        raise KeyError('Key not found')
```

```go [Go]
package main

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
}
```

```java [Java]
import java.util.LinkedList;

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
}
```

:::
