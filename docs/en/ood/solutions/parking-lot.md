# Design a Parking Lot

> 源自《The System Design Primer》OOD 方案（Donne Martin, CC BY 4.0），代码提供 Python / Go / Java 三种实现。

## Constraints and assumptions

* What types of vehicles should we support?
    * Motorcycle, Car, Bus
* Does each vehicle type take up a different amount of parking spots?
    * Yes
    * Motorcycle spot -> Motorcycle
    * Compact spot -> Motorcycle, Car
    * Large spot -> Motorcycle, Car
    * Bus can park if we have 5 consecutive "large" spots
* Does the parking lot have multiple levels?
    * Yes

## Solution

::: code-group

```python [Python]
from abc import ABCMeta, abstractmethod
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
        self.vehicle = None
```

```go [Go]
package main

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
func (s *ParkingSpot) RemoveVehicle()        { s.vehicle = nil }
```

```java [Java]
import java.util.ArrayList;
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
}
```

:::
