/**
 * Time Registration Test Data Builder
 *
 * Fluent builder pattern for creating time registration test data
 */

import type {
  CreateTimeRegistrationCommand,
  UpdateTimeRegistrationCommand,
} from "@/types";

export class TimeRegistrationBuilder {
  private data: Partial<
    CreateTimeRegistrationCommand & { check_out?: string; status?: string }
  > = {
    check_in: new Date().toISOString(),
  };

  forWorker(workerId: string): this {
    this.data.worker_id = workerId;
    return this;
  }

  withCheckIn(checkIn: string | Date): this {
    this.data.check_in =
      typeof checkIn === "string" ? checkIn : checkIn.toISOString();
    return this;
  }

  withCheckOut(checkOut: string | Date): this {
    this.data.check_out =
      typeof checkOut === "string" ? checkOut : checkOut.toISOString();
    return this;
  }

  withNotes(notes: string): this {
    this.data.notes = notes;
    return this;
  }

  inProgress(): this {
    this.data.status = "in_progress";
    this.data.check_out = undefined;
    return this;
  }

  completed(): this {
    this.data.status = "completed";
    if (!this.data.check_out) {
      // Set check_out to 8 hours after check_in by default
      const checkInDate = new Date(this.data.check_in!);
      checkInDate.setHours(checkInDate.getHours() + 8);
      this.data.check_out = checkInDate.toISOString();
    }
    return this;
  }

  /**
   * Set check-in to N hours ago from now
   */
  checkInHoursAgo(hours: number): this {
    const date = new Date();
    date.setHours(date.getHours() - hours);
    this.data.check_in = date.toISOString();
    return this;
  }

  /**
   * Set work duration in hours (automatically calculates check_out)
   */
  withDuration(hours: number): this {
    const checkInDate = new Date(this.data.check_in!);
    checkInDate.setHours(checkInDate.getHours() + hours);
    this.data.check_out = checkInDate.toISOString();
    this.data.status = "completed";
    return this;
  }

  build(): CreateTimeRegistrationCommand {
    return {
      worker_id: this.data.worker_id!,
      check_in: this.data.check_in!,
      notes: this.data.notes,
    };
  }

  buildUpdate(): UpdateTimeRegistrationCommand {
    return {
      check_in: this.data.check_in,
      check_out: this.data.check_out,
      status: this.data.status as "in_progress" | "completed",
      notes: this.data.notes,
    };
  }
}

/**
 * Create a new time registration builder
 */
export function aTimeRegistration(): TimeRegistrationBuilder {
  return new TimeRegistrationBuilder();
}
