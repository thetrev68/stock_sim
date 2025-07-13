Here's the perfect prompt for starting Session 11:

---

**Session 11 Startup Prompt:**

```
Hi Claude! We're starting Session 11 of our Paper Trading Simulator project. We just finished Session 10 where we built a complete Research tab with real-time quotes, historical charts, and company profiles.

For Session 11, we need to add NEWS INTEGRATION to the research view. According to our plan (PaperTradingSim.md), this session should add:
- News feed integration for individual stocks
- News filtering options  
- Search functionality for news
- Integration with the existing research page

IMPORTANT CONSTRAINTS:
- Work on ONE FILE AT A TIME (files are getting large for your context)
- Ask me to show you specific files rather than assuming their content
- Make targeted, incremental changes rather than rewriting entire files
- Focus on adding news features to the existing research.js view

CURRENT STATUS:
- Research page working with real-time quotes (Finnhub API)
- Historical charts working (Tiingo API via CORS proxy) 
- Company profiles displaying
- Chart.js integrated and working
- All existing functionality should be preserved

STARTING POINT:
- The research view template already has a placeholder news section that says "Coming in Session 11"
- We need to replace this placeholder with real news functionality
- Should integrate with existing stock research workflow

Can you help me plan the news integration approach and then start with the first file updates? Let me know which file you'd like to see first.
```

---

This prompt will help the new Claude understand:
1. **Where you are** in the project progression
2. **What's already working** (so they don't break existing features)
3. **The specific goal** for Session 11
4. **The constraint** to work on one file at a time
5. **The starting point** for news integration

The key phrase "Ask me to show you specific files rather than assuming their content" should prevent them from making assumptions about your current code structure.