import { z } from 'zod';
import { publicProcedure } from '../../create-context';

interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'personal' | 'group';
  groupId?: string;
  groupName?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedBy: string;
  assignedTo: string;
  createdAt: string;
}

let assignments: Assignment[] = [
  {
    id: '1',
    title: 'Read Romans Chapter 8',
    description: 'Study and meditate on Romans 8. Focus on verses 28-39 about God\'s love.',
    type: 'personal',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    assignedBy: 'Prophet Joshua Matthews',
    assignedTo: 'guest',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Prayer Journey Week 1',
    description: 'Dedicate 30 minutes daily to prayer this week. Journal your experiences.',
    type: 'personal',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    assignedBy: 'Prophet Joshua Matthews',
    assignedTo: 'guest',
    createdAt: new Date().toISOString(),
  },
];

export const listAssignmentsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      type: z.enum(['personal', 'group']).optional(),
      status: z.enum(['pending', 'in-progress', 'completed']).optional(),
    })
  )
  .query(({ input }) => {
    let filtered = assignments.filter((a) => a.assignedTo === input.userId);

    if (input.type) {
      filtered = filtered.filter((a) => a.type === input.type);
    }

    if (input.status) {
      filtered = filtered.filter((a) => a.status === input.status);
    }

    return {
      assignments: filtered,
      total: filtered.length,
    };
  });

export const createAssignmentProcedure = publicProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string(),
      type: z.enum(['personal', 'group']),
      groupId: z.string().optional(),
      groupName: z.string().optional(),
      dueDate: z.string(),
      assignedBy: z.string(),
      assignedTo: z.union([z.string(), z.array(z.string())]),
    })
  )
  .mutation(({ input }) => {
    const assignedToUsers = Array.isArray(input.assignedTo)
      ? input.assignedTo
      : [input.assignedTo];

    const newAssignments = assignedToUsers.map((userId) => ({
      id: `${Date.now()}-${Math.random()}`,
      title: input.title,
      description: input.description,
      type: input.type,
      groupId: input.groupId,
      groupName: input.groupName,
      dueDate: input.dueDate,
      status: 'pending' as const,
      assignedBy: input.assignedBy,
      assignedTo: userId,
      createdAt: new Date().toISOString(),
    }));

    assignments.unshift(...newAssignments);
    console.log(`🎓 New assignment created: ${input.title} for ${assignedToUsers.length} user(s)`);

    return { success: true, assignments: newAssignments };
  });

export const updateAssignmentStatusProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'in-progress', 'completed']),
    })
  )
  .mutation(({ input }) => {
    const assignment = assignments.find((a) => a.id === input.id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.status = input.status;
    console.log(`✔️ Assignment ${assignment.title} updated to ${input.status}`);

    return assignment;
  });

export const deleteAssignmentProcedure = publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ input }) => {
    assignments = assignments.filter((a) => a.id !== input.id);
    return { success: true };
  });

export const getAssignmentStatsProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(({ input }) => {
    const userAssignments = assignments.filter((a) => a.assignedTo === input.userId);

    return {
      total: userAssignments.length,
      pending: userAssignments.filter((a) => a.status === 'pending').length,
      inProgress: userAssignments.filter((a) => a.status === 'in-progress').length,
      completed: userAssignments.filter((a) => a.status === 'completed').length,
    };
  });