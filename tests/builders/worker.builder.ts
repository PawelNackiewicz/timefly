/**
 * Worker Test Data Builder
 *
 * Fluent builder pattern for creating worker test data
 */

import type { CreateWorkerCommand } from "@/types";

export class WorkerBuilder {
  private data: Partial<CreateWorkerCommand> = {
    first_name: "Test",
    last_name: "Worker",
    pin: "9999",
    is_active: true,
  };

  withName(firstName: string, lastName: string): this {
    this.data.first_name = firstName;
    this.data.last_name = lastName;
    return this;
  }

  withFirstName(firstName: string): this {
    this.data.first_name = firstName;
    return this;
  }

  withLastName(lastName: string): this {
    this.data.last_name = lastName;
    return this;
  }

  withPin(pin: string): this {
    this.data.pin = pin;
    return this;
  }

  withDepartment(department: string | null): this {
    this.data.department = department;
    return this;
  }

  inactive(): this {
    this.data.is_active = false;
    return this;
  }

  active(): this {
    this.data.is_active = true;
    return this;
  }

  build(): CreateWorkerCommand {
    return {
      first_name: this.data.first_name!,
      last_name: this.data.last_name!,
      pin: this.data.pin!,
      department: this.data.department,
      is_active: this.data.is_active,
    };
  }

  /**
   * Build multiple workers with incremented PINs
   */
  buildMany(count: number): CreateWorkerCommand[] {
    const workers: CreateWorkerCommand[] = [];
    const basePin = parseInt(this.data.pin || "1000");

    for (let i = 0; i < count; i++) {
      const worker = {
        ...this.data,
        first_name: `${this.data.first_name}${i + 1}`,
        last_name: `${this.data.last_name}${i + 1}`,
        pin: (basePin + i).toString().padStart(4, "0"),
      } as CreateWorkerCommand;
      workers.push(worker);
    }

    return workers;
  }
}

/**
 * Create a new worker builder
 */
export function aWorker(): WorkerBuilder {
  return new WorkerBuilder();
}
