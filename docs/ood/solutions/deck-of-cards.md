# 设计一副牌

> 源自《The System Design Primer》OOD 方案（Donne Martin, CC BY 4.0），代码提供 Python / Go / Java 三种实现。

## 约束与假设

* 这是一副用于扑克、二十一点等游戏的通用牌组吗？
    * 是的，先设计通用牌组，再扩展出二十一点（Black Jack）
* 可以假设牌组有 52 张牌（2-10、J、Q、K、A）和 4 种花色吗？
    * 可以
* 可以假设输入都是合法的吗，还是需要校验？
    * 假设输入合法

## 方案

::: code-group

```python [Python]
from abc import ABCMeta, abstractmethod
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
        random.shuffle(self.cards)
```

```go [Go]
package main

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
}
```

```java [Java]
import java.util.ArrayList;
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
}
```

:::
