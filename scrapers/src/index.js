import dotenv from 'dotenv';
import JumboScraper from './scrapers/jumbo.js';
import LiderScraper from './scrapers/lider.js';

dotenv.config();

/**
 * Scraper orchestrator
 * Manages execution of multiple scrapers
 */
class ScraperOrchestrator {
  constructor() {
    this.scrapers = {
      jumbo: JumboScraper,
      lider: LiderScraper,
      // Add more scrapers here as they are implemented
      // santaisabel: SantaIsabelScraper,
      // acuenta: AcuentaScraper,
      // unimarc: UnimarcScraper,
      // mayorista10: Mayorista10Scraper,
      // cugat: CugatScraper,
      // trebol: TrebolScraper,
      // eltit: EltitScraper,
    };
  }

  /**
   * Run a specific scraper
   */
  async runScraper(scraperName) {
    const ScraperClass = this.scrapers[scraperName];
    
    if (!ScraperClass) {
      console.error(`✗ Scraper not found: ${scraperName}`);
      console.log(`Available scrapers: ${Object.keys(this.scrapers).join(', ')}`);
      return null;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting scraper: ${scraperName.toUpperCase()}`);
    console.log(`${'='.repeat(60)}\n`);

    const scraper = new ScraperClass();
    const result = await scraper.scrape();

    return result;
  }

  /**
   * Run all scrapers
   */
  async runAll() {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running ALL scrapers`);
    console.log(`${'='.repeat(60)}\n`);

    const results = [];
    const scraperNames = Object.keys(this.scrapers);

    for (const scraperName of scraperNames) {
      try {
        const result = await this.runScraper(scraperName);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`✗ Error running scraper ${scraperName}:`, error);
        results.push({
          success: false,
          supermarket: scraperName,
          error: error.message,
        });
      }

      // Delay between scrapers to avoid overloading
      if (scraperNames.indexOf(scraperName) < scraperNames.length - 1) {
        console.log('\n⏳ Waiting before next scraper...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    return results;
  }

  /**
   * Print summary of results
   */
  printSummary(results) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SCRAPING SUMMARY`);
    console.log(`${'='.repeat(60)}\n`);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalProducts = results.reduce((sum, r) => sum + (r.count || 0), 0);

    console.log(`Total scrapers run: ${results.length}`);
    console.log(`Successful: ${successful.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log(`Total products scraped: ${totalProducts}\n`);

    if (successful.length > 0) {
      console.log('✓ Successful scrapers:');
      successful.forEach(r => {
        console.log(`  - ${r.supermarket}: ${r.count} products (${r.duration}s)`);
      });
    }

    if (failed.length > 0) {
      console.log('\n✗ Failed scrapers:');
      failed.forEach(r => {
        console.log(`  - ${r.supermarket}: ${r.error}`);
      });
    }

    console.log(`\n${'='.repeat(60)}\n`);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    all: false,
    supermarket: null,
  };

  for (const arg of args) {
    if (arg === '--all') {
      options.all = true;
    } else if (arg.startsWith('--supermarket=')) {
      options.supermarket = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Main execution
 */
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║        SupermarketWS Web Scraper                  ║
║        Price Comparison Platform - Temuco         ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);

  const options = parseArgs();
  const orchestrator = new ScraperOrchestrator();
  let results = [];

  try {
    if (options.all) {
      // Run all scrapers
      results = await orchestrator.runAll();
    } else if (options.supermarket) {
      // Run specific scraper
      const result = await orchestrator.runScraper(options.supermarket);
      if (result) {
        results = [result];
      }
    } else {
      // Default: show usage
      console.log('Usage:');
      console.log('  npm start                          # Show this help');
      console.log('  npm run scrape:all                 # Run all scrapers');
      console.log('  npm run scrape:jumbo               # Run Jumbo scraper');
      console.log('  npm run scrape:lider               # Run Lider scraper');
      console.log('\nAvailable scrapers:');
      Object.keys(orchestrator.scrapers).forEach(name => {
        console.log(`  - ${name}`);
      });
      console.log('\n');
      return;
    }

    // Print summary
    if (results.length > 0) {
      orchestrator.printSummary(results);
    }

    // Save results to file (optional)
    if (process.env.SAVE_RESULTS === 'true') {
      const fs = await import('fs');
      const outputFile = `results/scraping-${Date.now()}.json`;
      fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
      console.log(`📁 Results saved to: ${outputFile}\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Fatal error:', error);
    process.exit(1);
  }
}

// Run main
main();

export default ScraperOrchestrator;
