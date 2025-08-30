export interface Quote {
  id: string;
  quote: string;
  author: string;
  category: 'motivation' | 'success' | 'health' | 'mindfulness' | 'productivity';
  tags: string[];
}

export class MotivationalQuotesService {
  private static instance: MotivationalQuotesService;
  private quotes: Quote[] = [
    // Motivation
    {
      id: '1',
      quote: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      category: 'motivation',
      tags: ['passion', 'work', 'success'],
    },
    {
      id: '2',
      quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
      author: 'Winston Churchill',
      category: 'motivation',
      tags: ['perseverance', 'courage', 'success'],
    },
    {
      id: '3',
      quote: 'The future belongs to those who believe in the beauty of their dreams.',
      author: 'Eleanor Roosevelt',
      category: 'motivation',
      tags: ['dreams', 'future', 'belief'],
    },
    {
      id: '4',
      quote: 'Don\'t watch the clock; do what it does. Keep going.',
      author: 'Sam Levenson',
      category: 'motivation',
      tags: ['persistence', 'time', 'action'],
    },
    {
      id: '5',
      quote: 'The only limit to our realization of tomorrow is our doubts of today.',
      author: 'Franklin D. Roosevelt',
      category: 'motivation',
      tags: ['doubt', 'future', 'realization'],
    },

    // Success
    {
      id: '6',
      quote: 'Success is walking from failure to failure with no loss of enthusiasm.',
      author: 'Winston Churchill',
      category: 'success',
      tags: ['failure', 'enthusiasm', 'persistence'],
    },
    {
      id: '7',
      quote: 'The road to success and the road to failure are almost exactly the same.',
      author: 'Colin Davis',
      category: 'success',
      tags: ['road', 'failure', 'success'],
    },
    {
      id: '8',
      quote: 'Success usually comes to those who are too busy to be looking for it.',
      author: 'Henry David Thoreau',
      category: 'success',
      tags: ['busy', 'focus', 'success'],
    },
    {
      id: '9',
      quote: 'Success is not the key to happiness. Happiness is the key to success.',
      author: 'Herman Cain',
      category: 'success',
      tags: ['happiness', 'success', 'key'],
    },
    {
      id: '10',
      quote: 'The secret of success is to do the common thing uncommonly well.',
      author: 'John D. Rockefeller',
      category: 'success',
      tags: ['secret', 'common', 'excellence'],
    },

    // Health
    {
      id: '11',
      quote: 'Take care of your body. It\'s the only place you have to live.',
      author: 'Jim Rohn',
      category: 'health',
      tags: ['body', 'care', 'health'],
    },
    {
      id: '12',
      quote: 'Health is a state of complete physical, mental and social well-being.',
      author: 'World Health Organization',
      category: 'health',
      tags: ['physical', 'mental', 'social'],
    },
    {
      id: '13',
      quote: 'The greatest wealth is health.',
      author: 'Ralph Waldo Emerson',
      category: 'health',
      tags: ['wealth', 'health', 'value'],
    },
    {
      id: '14',
      quote: 'Your body hears everything your mind says.',
      author: 'Naomi Judd',
      category: 'health',
      tags: ['body', 'mind', 'connection'],
    },
    {
      id: '15',
      quote: 'Wellness is the complete integration of body, mind, and spirit.',
      author: 'Greg Anderson',
      category: 'health',
      tags: ['wellness', 'integration', 'holistic'],
    },

    // Mindfulness
    {
      id: '16',
      quote: 'Mindfulness isn\'t difficult. We just need to remember to do it.',
      author: 'Sharon Salzberg',
      category: 'mindfulness',
      tags: ['mindfulness', 'remember', 'practice'],
    },
    {
      id: '17',
      quote: 'The present moment is filled with joy and happiness.',
      author: 'Thich Nhat Hanh',
      category: 'mindfulness',
      tags: ['present', 'joy', 'happiness'],
    },
    {
      id: '18',
      quote: 'Mindfulness is the aware, balanced acceptance of the present experience.',
      author: 'Sylvia Boorstein',
      category: 'mindfulness',
      tags: ['aware', 'balanced', 'acceptance'],
    },
    {
      id: '19',
      quote: 'In the midst of movement and chaos, keep stillness inside of you.',
      author: 'Deepak Chopra',
      category: 'mindfulness',
      tags: ['movement', 'chaos', 'stillness'],
    },
    {
      id: '20',
      quote: 'Mindfulness is a way of befriending ourselves and our experience.',
      author: 'Jon Kabat-Zinn',
      category: 'mindfulness',
      tags: ['befriend', 'self', 'experience'],
    },

    // Productivity
    {
      id: '21',
      quote: 'Productivity is never an accident. It is always the result of a commitment to excellence.',
      author: 'Paul J. Meyer',
      category: 'productivity',
      tags: ['excellence', 'commitment', 'result'],
    },
    {
      id: '22',
      quote: 'The key is not to prioritize what\'s on your schedule, but to schedule your priorities.',
      author: 'Stephen Covey',
      category: 'productivity',
      tags: ['priorities', 'schedule', 'planning'],
    },
    {
      id: '23',
      quote: 'Don\'t say you don\'t have enough time. You have exactly the same number of hours per day.',
      author: 'H. Jackson Brown Jr.',
      category: 'productivity',
      tags: ['time', 'hours', 'equality'],
    },
    {
      id: '24',
      quote: 'Efficiency is doing things right; effectiveness is doing the right things.',
      author: 'Peter Drucker',
      category: 'productivity',
      tags: ['efficiency', 'effectiveness', 'right'],
    },
    {
      id: '25',
      quote: 'The two most powerful warriors are patience and time.',
      author: 'Leo Tolstoy',
      category: 'productivity',
      tags: ['patience', 'time', 'warriors'],
    },

    // Morning Motivation
    {
      id: '26',
      quote: 'Every morning we are born again. What we do today matters most.',
      author: 'Buddha',
      category: 'motivation',
      tags: ['morning', 'new', 'today'],
    },
    {
      id: '27',
      quote: 'Morning is an important time of day, because how you spend your morning can often tell you.',
      author: 'Lemony Snicket',
      category: 'motivation',
      tags: ['morning', 'day', 'spend'],
    },
    {
      id: '28',
      quote: 'The sun is a daily reminder that we too can rise again from the darkness.',
      author: 'S. Ajna',
      category: 'motivation',
      tags: ['sun', 'rise', 'darkness'],
    },
    {
      id: '29',
      quote: 'When you arise in the morning, think of what a precious privilege it is to be alive.',
      author: 'Marcus Aurelius',
      category: 'motivation',
      tags: ['arise', 'morning', 'privilege'],
    },
    {
      id: '30',
      quote: 'Morning is wonderful. Its only drawback is that it comes at such an inconvenient time of day.',
      author: 'Glen Cook',
      category: 'motivation',
      tags: ['morning', 'wonderful', 'inconvenient'],
    },
  ];

  private constructor() {}

  public static getInstance(): MotivationalQuotesService {
    if (!MotivationalQuotesService.instance) {
      MotivationalQuotesService.instance = new MotivationalQuotesService();
    }
    return MotivationalQuotesService.instance;
  }

  /**
   * Get a random quote
   */
  getRandomQuote(): Quote {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[randomIndex];
  }

  /**
   * Get a random quote by category
   */
  getRandomQuoteByCategory(category: Quote['category']): Quote {
    const categoryQuotes = this.quotes.filter(quote => quote.category === category);
    const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
    return categoryQuotes[randomIndex];
  }

  /**
   * Get a random quote by time of day
   */
  getQuoteByTimeOfDay(): Quote {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      // Morning (5 AM - 11:59 AM)
      return this.getRandomQuoteByCategory('motivation');
    } else if (hour >= 12 && hour < 17) {
      // Afternoon (12 PM - 4:59 PM)
      return this.getRandomQuoteByCategory('productivity');
    } else if (hour >= 17 && hour < 21) {
      // Evening (5 PM - 8:59 PM)
      return this.getRandomQuoteByCategory('success');
    } else {
      // Night (9 PM - 4:59 AM)
      return this.getRandomQuoteByCategory('mindfulness');
    }
  }

  /**
   * Get a quote for specific goal category
   */
  getQuoteForGoalCategory(goalCategory: string): Quote {
    const categoryMap: { [key: string]: Quote['category'] } = {
      'sleep': 'mindfulness',
      'water': 'health',
      'exercise': 'health',
      'mind': 'mindfulness',
      'screenTime': 'productivity',
      'shower': 'health',
      'custom': 'motivation',
    };

    const targetCategory = categoryMap[goalCategory] || 'motivation';
    return this.getRandomQuoteByCategory(targetCategory);
  }

  /**
   * Get daily quote (same quote for the same day)
   */
  getDailyQuote(): Quote {
    const today = new Date().toDateString();
    const hash = this.hashCode(today);
    const index = hash % this.quotes.length;
    return this.quotes[Math.abs(index)];
  }

  /**
   * Get motivational quote for goal completion
   */
  getGoalCompletionQuote(): Quote {
    const completionQuotes = this.quotes.filter(quote => 
      quote.category === 'success' || quote.category === 'motivation'
    );
    const randomIndex = Math.floor(Math.random() * completionQuotes.length);
    return completionQuotes[randomIndex];
  }

  /**
   * Get water reminder quote
   */
  getWaterQuote(): Quote {
    const waterQuotes = this.quotes.filter(quote => 
      quote.category === 'health' && quote.tags.includes('care')
    );
    if (waterQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * waterQuotes.length);
      return waterQuotes[randomIndex];
    }
    return this.getRandomQuoteByCategory('health');
  }

  /**
   * Get exercise motivation quote
   */
  getExerciseQuote(): Quote {
    const exerciseQuotes = this.quotes.filter(quote => 
      quote.category === 'motivation' && quote.tags.includes('persistence')
    );
    if (exerciseQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * exerciseQuotes.length);
      return exerciseQuotes[randomIndex];
    }
    return this.getRandomQuoteByCategory('motivation');
  }

  /**
   * Get sleep preparation quote
   */
  getSleepQuote(): Quote {
    const sleepQuotes = this.quotes.filter(quote => 
      quote.category === 'mindfulness' && quote.tags.includes('stillness')
    );
    if (sleepQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * sleepQuotes.length);
      return sleepQuotes[randomIndex];
    }
    return this.getRandomQuoteByCategory('mindfulness');
  }

  /**
   * Search quotes by keyword
   */
  searchQuotes(keyword: string): Quote[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.quotes.filter(quote => 
      quote.quote.toLowerCase().includes(lowerKeyword) ||
      quote.author.toLowerCase().includes(lowerKeyword) ||
      quote.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
  }

  /**
   * Get all quotes by category
   */
  getAllQuotesByCategory(category: Quote['category']): Quote[] {
    return this.quotes.filter(quote => quote.category === category);
  }

  /**
   * Get all categories
   */
  getAllCategories(): Quote['category'][] {
    return [...new Set(this.quotes.map(quote => quote.category))];
  }

  /**
   * Simple hash function for consistent daily quotes
   */
  private hashCode(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
}
