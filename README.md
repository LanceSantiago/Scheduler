# Scheduler

## Purpose

Scheduler's main goal is to schedule groups/users into certain timeslots. Users are only allowed to book available timeslots that no other user has currently booked.

## Core Features
- Endpoint: GET /api/schedule/appointment -> return all appointments
- Endpoint: POST /api/schedule/appointment -> schedules an appointment at the specified time
- Endpoint: DELETE /api/schedule/appointment -> Removes scheduled appointment allowing users to book that timeslot
- Ability to add timeslots (endpoint only)


## Potential Additional Features
- Users able to login/create accounts
- Ability to reschedule appointments