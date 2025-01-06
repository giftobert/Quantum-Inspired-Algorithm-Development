import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let projectCount = 0;
const collaborativeProjects = new Map();
const projectContributions = new Map();

// Simulated contract functions
function createProject(algorithmId: number, title: string, description: string, leadDeveloper: string) {
  const projectId = ++projectCount;
  collaborativeProjects.set(projectId, {
    leadDeveloper,
    algorithmId,
    title,
    description,
    collaborators: [leadDeveloper],
    status: "active",
    startTime: Date.now(),
    endTime: null
  });
  return projectId;
}

function addCollaborator(projectId: number, collaborator: string, adder: string) {
  const project = collaborativeProjects.get(projectId);
  if (!project) throw new Error('Invalid project');
  if (project.leadDeveloper !== adder) throw new Error('Not authorized');
  if (project.collaborators.length >= 10) throw new Error('Maximum collaborators reached');
  project.collaborators.push(collaborator);
  collaborativeProjects.set(projectId, project);
  return true;
}

function addContribution(projectId: number, contribution: string, contributor: string) {
  const project = collaborativeProjects.get(projectId);
  if (!project) throw new Error('Invalid project');
  if (!project.collaborators.includes(contributor)) throw new Error('Not authorized');
  const contributionKey = `${projectId}-${contributor}`;
  projectContributions.set(contributionKey, {
    contribution,
    timestamp: Date.now()
  });
  return true;
}

function endProject(projectId: number, ender: string) {
  const project = collaborativeProjects.get(projectId);
  if (!project) throw new Error('Invalid project');
  if (project.leadDeveloper !== ender) throw new Error('Not authorized');
  project.status = "completed";
  project.endTime = Date.now();
  collaborativeProjects.set(projectId, project);
  return true;
}

describe('Collaborative Development Platform Contract', () => {
  beforeEach(() => {
    projectCount = 0;
    collaborativeProjects.clear();
    projectContributions.clear();
  });
  
  it('should create a new collaborative project', () => {
    const id = createProject(1, 'Quantum-Inspired Optimization', 'Developing a novel quantum-inspired algorithm', 'developer1');
    expect(id).toBe(1);
    const project = collaborativeProjects.get(id);
    expect(project.title).toBe('Quantum-Inspired Optimization');
    expect(project.status).toBe('active');
  });
  
  it('should add a collaborator to the project', () => {
    const id = createProject(2, 'QAOA Enhancement', 'Improving QAOA for specific problem classes', 'developer2');
    expect(addCollaborator(id, 'developer3', 'developer2')).toBe(true);
    const project = collaborativeProjects.get(id);
    expect(project.collaborators).toContain('developer3');
  });
  
  it('should add a contribution to the project', () => {
    const id = createProject(3, 'Quantum Annealing Simulator', 'Building a quantum annealing simulator', 'developer4');
    addCollaborator(id, 'developer5', 'developer4');
    expect(addContribution(id, 'Implemented core annealing function', 'developer5')).toBe(true);
    const contributionKey = `${id}-developer5`;
    const contribution = projectContributions.get(contributionKey);
    expect(contribution.contribution).toBe('Implemented core annealing function');
  });
  
  it('should end the project', () => {
    const id = createProject(4, 'Quantum-Classical Hybrid Algorithm', 'Developing a hybrid quantum-classical algorithm', 'developer6');
    expect(endProject(id, 'developer6')).toBe(true);
    const project = collaborativeProjects.get(id);
    expect(project.status).toBe('completed');
    expect(project.endTime).toBeTruthy();
  });
  
  it('should not allow unauthorized collaborator addition', () => {
    const id = createProject(5, 'Quantum Error Correction', 'Implementing quantum error correction algorithms', 'developer7');
    expect(() => addCollaborator(id, 'developer8', 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should not allow contributions from non-collaborators', () => {
    const id = createProject(6, 'Quantum Machine Learning', 'Exploring quantum algorithms for machine learning', 'developer9');
    expect(() => addContribution(id, 'Unauthorized contribution', 'non_collaborator')).toThrow('Not authorized');
  });
  
  it('should not allow unauthorized project termination', () => {
    const id = createProject(7, 'Quantum Cryptography', 'Developing quantum-resistant cryptographic algorithms', 'developer10');
    expect(() => endProject(id, 'unauthorized_user')).toThrow('Not authorized');
  });
});

