import re

with open('e:/projects/Dashboard/src/pages/Home/HomePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Tasks
content = content.replace('{/* Today\'s Tasks */}\n        <div className="glass-card home-section">', '{/* Today\'s Tasks */}\n        {settings.dashboardWidgets?.tasks !== false && (\n        <div className="glass-card home-section">')
content = content.replace('</div>\n\n        {/* Habits Progress */}', '</div>\n        )}\n\n        {/* Habits Progress */}')

# Replace Habits
content = content.replace('{/* Habits Progress */}\n        <div className="glass-card home-section">', '{/* Habits Progress */}\n        {settings.dashboardWidgets?.habits !== false && (\n        <div className="glass-card home-section">')
content = content.replace('</div>\n\n        {/* Upcoming Bills */}', '</div>\n        )}\n\n        {/* Upcoming Bills */}')

# Replace Bills
content = content.replace('{/* Upcoming Bills */}\n        <div className="glass-card home-section">', '{/* Upcoming Bills */}\n        {settings.dashboardWidgets?.bills !== false && (\n        <div className="glass-card home-section">')
content = content.replace('</div>\n\n        {/* Recent Transactions */}', '</div>\n        )}\n\n        {/* Recent Transactions */}')

# Replace Transactions
content = content.replace('{/* Recent Transactions */}\n        <div className="glass-card home-section">', '{/* Recent Transactions */}\n        {settings.dashboardWidgets?.transactions !== false && (\n        <div className="glass-card home-section">')
content = content.replace('</div>\n\n        {/* This Month */}', '</div>\n        )}\n\n        {/* This Month */}')

# Replace Monthly
content = content.replace('{/* This Month */}\n        <div className="glass-card home-section monthly-overview">', '{/* This Month */}\n        {settings.dashboardWidgets?.monthlyOverview !== false && (\n        <div className="glass-card home-section monthly-overview">')
content = content.replace('</div>\n\n        {/* Today\'s Routine */}', '</div>\n        )}\n\n        {/* Today\'s Routine */}')

# Replace Routine
content = content.replace('{/* Today\'s Routine */}\n        <div className="glass-card home-section">', '{/* Today\'s Routine */}\n        {settings.dashboardWidgets?.routine !== false && (\n        <div className="glass-card home-section">')
content = content.replace('</div>\n      </div>\n    </div>\n  );\n}', '</div>\n        )}\n      </div>\n    </div>\n  );\n}')

with open('e:/projects/Dashboard/src/pages/Home/HomePage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
