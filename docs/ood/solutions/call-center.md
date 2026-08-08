# 设计呼叫中心

> 源自《The System Design Primer》OOD 方案（Donne Martin, CC BY 4.0），代码提供 Python / Go / Java 三种实现。

## 约束与假设

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
    * 假设输入合法

## 方案

::: code-group

```python [Python]
from abc import ABCMeta, abstractmethod
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
        pass
```

```go [Go]
package main

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
func (c *CallCenter) NotifyCallCompleted(call *Call) {}
```

```java [Java]
import java.util.ArrayDeque;
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
}
```

:::
