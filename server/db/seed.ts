import { Subject, LearningResource, QuizQuestion } from '../types.js';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-cs-dsa',
    name: 'Data Structures & Algorithms',
    category: 'Computer Science',
    description: 'Arrays, Trees, Graphs, Sorting, Searching, and Dynamic Programming',
    topics: [
      'Arrays & Two Pointers',
      'Binary Search Trees',
      'Graph Traversals (BFS & DFS)',
      'Dynamic Programming Basics',
      'Recursion & Backtracking',
      'Hash Maps & Collision Resolution'
    ]
  },
  {
    id: 'subj-python',
    name: 'Python Programming',
    category: 'Programming Languages',
    description: 'Core Python, OOP, Functional Programming, Standard Library, and Data Processing',
    topics: [
      'Python Syntax & Data Structures',
      'Object-Oriented Programming (OOP)',
      'List Comprehensions & Generators',
      'File Handling & Exception Management',
      'Working with JSON & APIs',
      'Unit Testing in Python'
    ]
  },
  {
    id: 'subj-web-dev',
    name: 'Full-Stack Web Development',
    category: 'Software Engineering',
    description: 'Modern HTML/CSS, React, RESTful APIs, Node.js, and Database Integration',
    topics: [
      'Responsive Web Layouts (Tailwind & CSS Grid)',
      'JavaScript ES6+ & Async/Await',
      'React Components & State Hooks',
      'REST API Design & HTTP Status Codes',
      'Database Queries & Normalization',
      'Authentication & JWT Security'
    ]
  },
  {
    id: 'subj-data-science',
    name: 'Data Science & Machine Learning',
    category: 'Artificial Intelligence',
    description: 'Pandas, NumPy, Supervised Learning, Model Evaluation, and Scikit-Learn',
    topics: [
      'Data Wrangling with Pandas',
      'Vectorized Operations with NumPy',
      'Linear & Logistic Regression',
      'Decision Trees & Random Forests',
      'Model Evaluation & Confusion Matrices',
      'Feature Engineering & Scaling'
    ]
  },
  {
    id: 'subj-math',
    name: 'Discrete Mathematics & Linear Algebra',
    category: 'Mathematics',
    description: 'Logic, Combinatorics, Matrix Operations, Eigenvalues, and Probability',
    topics: [
      'Propositional Logic & Truth Tables',
      'Set Theory & Relations',
      'Matrix Multiplication & Inverses',
      'Eigenvalues and Eigenvectors',
      'Probability & Bayes Theorem',
      'Graph Theory Fundamentals'
    ]
  }
];

export const INITIAL_RESOURCES: LearningResource[] = [
  // DSA
  {
    id: 'res-dsa-1',
    title: 'Visual Guide to Binary Search Trees',
    description: 'Interactive visualization and breakdown of tree insertions, deletions, and traversal orders.',
    subject: 'Data Structures & Algorithms',
    topic: 'Binary Search Trees',
    difficulty: 'Intermediate',
    resourceType: 'Interactive',
    url: 'https://visualgo.net/en/bst',
    estimatedMinutes: 45,
    provider: 'VisuAlgo',
    tags: ['trees', 'visualization', 'binary search'],
    ratingAverage: 4.9,
    ratingsCount: 142
  },
  {
    id: 'res-dsa-2',
    title: 'MIT 6.006: Introduction to Algorithms - Graph Traversal',
    description: 'Comprehensive academic lecture by MIT OpenCourseWare covering Breadth-First and Depth-First Search.',
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Traversals (BFS & DFS)',
    difficulty: 'Intermediate',
    resourceType: 'Video',
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
    estimatedMinutes: 50,
    provider: 'MIT OpenCourseWare',
    tags: ['graphs', 'bfs', 'dfs', 'academic'],
    ratingAverage: 4.8,
    ratingsCount: 98
  },
  {
    id: 'res-dsa-3',
    title: 'Dynamic Programming Patterns: Memoization vs Tabulation',
    description: 'A deep-dive tutorial breaking down subproblem overlap, state transitions, and recurrence relations.',
    subject: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming Basics',
    difficulty: 'Advanced',
    resourceType: 'Article',
    url: 'https://www.freecodecamp.org/news/demystifying-dynamic-programming-24fb83a1c704/',
    estimatedMinutes: 35,
    provider: 'freeCodeCamp',
    tags: ['dynamic programming', 'memoization', 'algorithms'],
    ratingAverage: 4.7,
    ratingsCount: 86
  },
  {
    id: 'res-dsa-4',
    title: 'NeetCode Roadmap: Two Pointers & Sliding Window',
    description: 'Curated problem sets and walk-throughs for mastering array traversal techniques.',
    subject: 'Data Structures & Algorithms',
    topic: 'Arrays & Two Pointers',
    difficulty: 'Beginner',
    resourceType: 'Practice',
    url: 'https://neetcode.io/roadmap',
    estimatedMinutes: 40,
    provider: 'NeetCode',
    tags: ['arrays', 'two-pointers', 'coding interview'],
    ratingAverage: 4.9,
    ratingsCount: 210
  },

  // Python
  {
    id: 'res-py-1',
    title: 'Official Python Tutorial: Classes and OOP',
    description: 'The definitive guide to Python object orientation, inheritance, namespaces, and magic methods.',
    subject: 'Python Programming',
    topic: 'Object-Oriented Programming (OOP)',
    difficulty: 'Beginner',
    resourceType: 'Documentation',
    url: 'https://docs.python.org/3/tutorial/classes.html',
    estimatedMinutes: 30,
    provider: 'Python Software Foundation',
    tags: ['python', 'oop', 'classes', 'official'],
    ratingAverage: 4.6,
    ratingsCount: 74
  },
  {
    id: 'res-py-2',
    title: 'Corey Schafer: Python OOP Tutorials',
    description: 'Master class series explaining class methods, static methods, inheritance, and dunder methods clearly.',
    subject: 'Python Programming',
    topic: 'Object-Oriented Programming (OOP)',
    difficulty: 'Intermediate',
    resourceType: 'Video',
    url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTsqhI973-VITYR-kPRGZ69v',
    estimatedMinutes: 45,
    provider: 'Corey Schafer',
    tags: ['video', 'oop', 'python3'],
    ratingAverage: 5.0,
    ratingsCount: 320
  },
  {
    id: 'res-py-3',
    title: 'Python Generators & Iterators Explained with Diagrams',
    description: 'Memory-efficient processing using the yield keyword and generator expressions.',
    subject: 'Python Programming',
    topic: 'List Comprehensions & Generators',
    difficulty: 'Intermediate',
    resourceType: 'Article',
    url: 'https://realpython.com/introduction-to-python-generators/',
    estimatedMinutes: 25,
    provider: 'Real Python',
    tags: ['generators', 'iterators', 'performance'],
    ratingAverage: 4.8,
    ratingsCount: 65
  },
  {
    id: 'res-py-4',
    title: 'Pytest: Fast, Modern Unit Testing for Python',
    description: 'Step-by-step documentation on fixtures, parametrizing tests, and mocking API calls.',
    subject: 'Python Programming',
    topic: 'Unit Testing in Python',
    difficulty: 'Intermediate',
    resourceType: 'Documentation',
    url: 'https://docs.pytest.org/en/stable/',
    estimatedMinutes: 30,
    provider: 'Pytest Org',
    tags: ['testing', 'pytest', 'qa'],
    ratingAverage: 4.7,
    ratingsCount: 52
  },

  // Web Dev
  {
    id: 'res-web-1',
    title: 'MDN Web Docs: CSS Grid & Flexbox Mastery',
    description: 'The golden standard reference for responsive CSS layouts, alignment, and modern grid mechanics.',
    subject: 'Full-Stack Web Development',
    topic: 'Responsive Web Layouts (Tailwind & CSS Grid)',
    difficulty: 'Beginner',
    resourceType: 'Documentation',
    url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Grids',
    estimatedMinutes: 35,
    provider: 'MDN Web Docs',
    tags: ['css', 'grid', 'flexbox', 'layouts'],
    ratingAverage: 4.9,
    ratingsCount: 180
  },
  {
    id: 'res-web-2',
    title: 'JavaScript Event Loop & Asynchronous Execution',
    description: 'Philip Roberts legendary visual explanation of call stack, callback queue, microtasks, and event loop.',
    subject: 'Full-Stack Web Development',
    topic: 'JavaScript ES6+ & Async/Await',
    difficulty: 'Intermediate',
    resourceType: 'Video',
    url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
    estimatedMinutes: 26,
    provider: 'JSConf EU',
    tags: ['event loop', 'async', 'promises'],
    ratingAverage: 5.0,
    ratingsCount: 450
  },
  {
    id: 'res-web-3',
    title: 'React Official Documentation: Managing State & Effects',
    description: 'Interactive Sandboxes teaching state lifting, effect dependencies, and clean component architecture.',
    subject: 'Full-Stack Web Development',
    topic: 'React Components & State Hooks',
    difficulty: 'Intermediate',
    resourceType: 'Interactive',
    url: 'https://react.dev/learn/managing-state',
    estimatedMinutes: 40,
    provider: 'React Dev Team',
    tags: ['react', 'hooks', 'state'],
    ratingAverage: 4.9,
    ratingsCount: 290
  },
  {
    id: 'res-web-4',
    title: 'RESTful API Guidelines & HTTP Status Best Practices',
    description: 'Enterprise guide to clean REST semantics, idempotency, error payloads, and pagination.',
    subject: 'Full-Stack Web Development',
    topic: 'REST API Design & HTTP Status Codes',
    difficulty: 'Intermediate',
    resourceType: 'Article',
    url: 'https://restfulapi.net/',
    estimatedMinutes: 30,
    provider: 'Restful API Guide',
    tags: ['api', 'rest', 'http', 'backend'],
    ratingAverage: 4.6,
    ratingsCount: 88
  },

  // Data Science & ML
  {
    id: 'res-ml-1',
    title: '10 Minutes to Pandas - Quickstart Handbook',
    description: 'Essential data manipulation recipes: Series, DataFrames, indexing, filtering, and grouping.',
    subject: 'Data Science & Machine Learning',
    topic: 'Data Wrangling with Pandas',
    difficulty: 'Beginner',
    resourceType: 'Documentation',
    url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
    estimatedMinutes: 25,
    provider: 'Pandas Org',
    tags: ['pandas', 'dataframes', 'data wrangling'],
    ratingAverage: 4.8,
    ratingsCount: 160
  },
  {
    id: 'res-ml-2',
    title: 'StatQuest: Machine Learning Fundamentals & Decision Trees',
    description: 'Josh Starmer visual and intuitive breakdown of Entropy, Gini Impurity, and Tree splits.',
    subject: 'Data Science & Machine Learning',
    topic: 'Decision Trees & Random Forests',
    difficulty: 'Beginner',
    resourceType: 'Video',
    url: 'https://statquest.org/statquest-decision-trees-step-by-step/',
    estimatedMinutes: 35,
    provider: 'StatQuest',
    tags: ['machine learning', 'decision trees', 'visual math'],
    ratingAverage: 5.0,
    ratingsCount: 380
  },
  {
    id: 'res-ml-3',
    title: 'Scikit-Learn: Cross Validation & Hyperparameter Tuning',
    description: 'Hands-on guide to k-fold cross-validation, GridSearchCV, pipeline orchestration, and avoiding data leaks.',
    subject: 'Data Science & Machine Learning',
    topic: 'Model Evaluation & Confusion Matrices',
    difficulty: 'Intermediate',
    resourceType: 'Documentation',
    url: 'https://scikit-learn.org/stable/modules/cross_validation.html',
    estimatedMinutes: 35,
    provider: 'Scikit-Learn',
    tags: ['scikit-learn', 'cross-validation', 'model evaluation'],
    ratingAverage: 4.8,
    ratingsCount: 110
  },

  // Math
  {
    id: 'res-math-1',
    title: '3Blue1Brown: Essence of Linear Algebra',
    description: 'Geometric perspective on vectors, linear transformations, determinants, and matrix math.',
    subject: 'Discrete Mathematics & Linear Algebra',
    topic: 'Matrix Multiplication & Inverses',
    difficulty: 'Beginner',
    resourceType: 'Video',
    url: 'https://www.3blue1brown.com/topics/linear-algebra',
    estimatedMinutes: 45,
    provider: '3Blue1Brown',
    tags: ['linear algebra', 'matrices', 'geometry', 'visual'],
    ratingAverage: 5.0,
    ratingsCount: 620
  },
  {
    id: 'res-math-2',
    title: 'Khan Academy: Bayes Rule & Conditional Probability',
    description: 'Interactive exercises for understanding prior probability, likelihood, and posterior calculation.',
    subject: 'Discrete Mathematics & Linear Algebra',
    topic: 'Probability & Bayes Theorem',
    difficulty: 'Intermediate',
    resourceType: 'Interactive',
    url: 'https://www.khanacademy.org/math/statistics-probability/probability-library/bayes-theorem-probability/v/bayes-theorem-visualized',
    estimatedMinutes: 30,
    provider: 'Khan Academy',
    tags: ['probability', 'bayes theorem', 'statistics'],
    ratingAverage: 4.9,
    ratingsCount: 230
  }
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // DSA Questions
  {
    id: 'q-dsa-1',
    subject: 'Data Structures & Algorithms',
    topic: 'Binary Search Trees',
    difficulty: 'Easy',
    question: 'In an in-order traversal of a valid Binary Search Tree (BST), what property do the visited node values exhibit?',
    options: [
      'They are visited in strictly descending order',
      'They are visited in sorted, non-decreasing order',
      'The root is visited before all leaf nodes',
      'Nodes on the left subtree are always visited after the root'
    ],
    correctIndex: 1,
    explanation: 'An in-order traversal visits the left subtree, then the root, then the right subtree. Because every left descendant is less than the root and every right descendant is greater, this traversal naturally outputs values in sorted ascending order.'
  },
  {
    id: 'q-dsa-2',
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Traversals (BFS & DFS)',
    difficulty: 'Medium',
    question: 'Which data structure is primarily utilized to execute a Breadth-First Search (BFS) on an unweighted graph?',
    options: [
      'LIFO Stack',
      'FIFO Queue',
      'Min-Heap Priority Queue',
      'Binary Search Tree'
    ],
    correctIndex: 1,
    explanation: 'Breadth-First Search traverses level by level, ensuring nodes closest to the start vertex are examined first. A First-In-First-Out (FIFO) queue guarantees this level-order sequence.'
  },
  {
    id: 'q-dsa-3',
    subject: 'Data Structures & Algorithms',
    topic: 'Dynamic Programming Basics',
    difficulty: 'Medium',
    question: 'What are the two foundational properties required for a problem to be solvable via Dynamic Programming?',
    options: [
      'NP-Completeness and Greedy Choice',
      'Optimal Substructure and Overlapping Subproblems',
      'Logarithmic Tree Depth and Divide-and-Conquer splits',
      'Deterministic Finite Automata and Memory Boundaries'
    ],
    correctIndex: 1,
    explanation: 'Dynamic Programming applies when a problem exhibits Optimal Substructure (an optimal solution can be constructed from optimal subproblem solutions) and Overlapping Subproblems (the same subproblems are solved repeatedly).'
  },
  {
    id: 'q-dsa-4',
    subject: 'Data Structures & Algorithms',
    topic: 'Arrays & Two Pointers',
    difficulty: 'Easy',
    question: 'What is the optimal time complexity to determine if a sorted array contains two numbers that sum to target T using the two-pointer approach?',
    options: [
      'O(N^2)',
      'O(N log N)',
      'O(N)',
      'O(1)'
    ],
    correctIndex: 2,
    explanation: 'With left pointer at index 0 and right pointer at N-1, each comparison moves either left forward or right backward, scanning at most N elements in linear O(N) time with O(1) extra space.'
  },

  // Python Questions
  {
    id: 'q-py-1',
    subject: 'Python Programming',
    topic: 'Object-Oriented Programming (OOP)',
    difficulty: 'Easy',
    question: 'In Python class definitions, what purpose does the `__init__` method serve?',
    options: [
      'It creates the class namespace in the global memory table',
      'It acts as the constructor/initializer to set initial attributes on a newly created instance',
      'It deletes the object when garbage collection triggers',
      'It converts the instance into a JSON dictionary'
    ],
    correctIndex: 1,
    explanation: 'In Python, `__init__` is the instance initializer. Once `__new__` creates the object instance, `__init__` receives the new instance as `self` to set up instance attributes.'
  },
  {
    id: 'q-py-2',
    subject: 'Python Programming',
    topic: 'List Comprehensions & Generators',
    difficulty: 'Medium',
    question: 'What is the primary operational difference between a list comprehension `[x*2 for x in data]` and a generator expression `(x*2 for x in data)`?',
    options: [
      'List comprehensions can only process integer values',
      'Generators compute values lazily on demand without allocating the entire list in memory',
      'Generators are faster for random index access like `gen[5]`',
      'List comprehensions cannot be used inside for-loops'
    ],
    correctIndex: 1,
    explanation: 'Generator expressions yield items one by one on iteration (lazy evaluation), consuming O(1) memory, whereas list comprehensions eagerly allocate and construct the entire list in memory upfront.'
  },
  {
    id: 'q-py-3',
    subject: 'Python Programming',
    topic: 'Python Syntax & Data Structures',
    difficulty: 'Easy',
    question: 'Which of the following Python data structures is immutable?',
    options: [
      'List',
      'Dictionary',
      'Tuple',
      'Set'
    ],
    correctIndex: 2,
    explanation: 'Tuples are immutable sequences in Python; once initialized, their elements cannot be added, removed, or reassigned. Lists, Dictionaries, and Sets are all mutable.'
  },

  // Web Dev Questions
  {
    id: 'q-web-1',
    subject: 'Full-Stack Web Development',
    topic: 'JavaScript ES6+ & Async/Await',
    difficulty: 'Medium',
    question: 'What happens if a Promise created inside an `async` function rejects and has no `try/catch` block wrapping the `await` statement?',
    options: [
      'The browser silently re-tries the network call up to 3 times',
      'The async function returns undefined without throwing',
      'The returned Promise of the async function rejects with that error (unhandled rejection)',
      'The event loop halts all other microtasks permanently'
    ],
    correctIndex: 2,
    explanation: 'An async function wraps its entire body in a Promise. If an awaited promise rejects without catching, the wrapper Promise rejects with that uncaught error.'
  },
  {
    id: 'q-web-2',
    subject: 'Full-Stack Web Development',
    topic: 'REST API Design & HTTP Status Codes',
    difficulty: 'Easy',
    question: 'Which HTTP status code is most appropriate when a resource is successfully created via a POST request?',
    options: [
      '200 OK',
      '201 Created',
      '204 No Content',
      '202 Accepted'
    ],
    correctIndex: 1,
    explanation: 'HTTP 201 Created explicitly indicates that the request succeeded and resulted in one or more new resources being created on the server.'
  },
  {
    id: 'q-web-3',
    subject: 'Full-Stack Web Development',
    topic: 'React Components & State Hooks',
    difficulty: 'Medium',
    question: 'Why should state in React never be mutated directly (e.g., `items.push(newItem)`) before calling `setItems(items)`?',
    options: [
      'Direct mutation causes a fatal browser syntax error',
      'React uses reference equality (`Object.is`) to detect state changes; mutating the existing object keeps the reference identical and may skip re-renders',
      'Pushing to an array clears its prototype chain',
      'React only supports immutable primitive types like strings and numbers'
    ],
    correctIndex: 1,
    explanation: 'React compares previous and next state by reference. Mutating the existing array in-place preserves the memory address, so React considers nothing has changed and skips updating the DOM.'
  },

  // Machine Learning Questions
  {
    id: 'q-ml-1',
    subject: 'Data Science & Machine Learning',
    topic: 'Model Evaluation & Confusion Matrices',
    difficulty: 'Medium',
    question: 'In an imbalanced classification task (e.g. rare disease diagnosis), why is high Accuracy often misleading?',
    options: [
      'Accuracy cannot be expressed as a percentage',
      'A trivial classifier predicting only the majority negative class can achieve high accuracy while failing to detect positive cases',
      'Accuracy is mathematically undefined if True Positives exceed 100',
      'Scikit-learn requires ROC-AUC to compute gradients'
    ],
    correctIndex: 1,
    explanation: 'If 99% of patients are healthy, a naive model that predicts "healthy" for 100% of samples achieves 99% accuracy, yet has 0% Recall on the critical positive condition. Metrics like Precision, Recall, and F1-score are needed.'
  },
  {
    id: 'q-ml-2',
    subject: 'Data Science & Machine Learning',
    topic: 'Linear & Logistic Regression',
    difficulty: 'Easy',
    question: 'What mathematical function does Logistic Regression apply to its linear combination of inputs to produce output probabilities between 0 and 1?',
    options: [
      'Rectified Linear Unit (ReLU)',
      'Sigmoid (Logistic) Function',
      'Cosine Distance',
      'Hyperbolic Tangent without bias'
    ],
    correctIndex: 1,
    explanation: 'The Sigmoid function, $S(z) = 1 / (1 + e^{-z})$, squashes any real-valued number into the interval (0, 1), representing the probability of the positive class.'
  },

  // Math Questions
  {
    id: 'q-math-1',
    subject: 'Discrete Mathematics & Linear Algebra',
    topic: 'Matrix Multiplication & Inverses',
    difficulty: 'Medium',
    question: 'If a square matrix $A$ has a determinant equal to zero ($\det(A) = 0$), what can be concluded about its inverse $A^{-1}$?',
    options: [
      'Its inverse is the identity matrix $I$',
      'Its inverse does not exist ($A$ is a singular matrix)',
      'Its inverse equals its transpose $A^T$',
      'The matrix has exclusively negative eigenvalues'
    ],
    correctIndex: 1,
    explanation: 'The formula for the inverse includes dividing by the determinant: $A^{-1} = (1 / \det(A)) \cdot \text{adj}(A)$. Division by zero is undefined, so a matrix with $\det(A) = 0$ is singular and non-invertible.'
  }
];
