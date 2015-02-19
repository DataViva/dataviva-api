import click
import urlparse
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


@click.command()
@click.argument('base_url', type=str)
def main(base_url):
    if not base_url.startswith("http://"):
        base_url = "http://" + base_url
    pages = ['/', '/apps']
    for page in pages:
        target = urlparse.urljoin(base_url, page)
        print "Crawling:", target
        crawl_page(target)


def crawl_page(page):
    driver = webdriver.Firefox()
    driver.get(page)
    links = driver.find_elements_by_tag_name("a")
    driver.implicitly_wait(5)

    urls = []

    for link in links:
        driver.switch_to_default_content()
        if link.is_displayed():
            url = link.get_attribute("href")
            print "url", url
            if url:
                urls.append(url)

    for url in urls:    
        driver.get(url)
        if "profiles/" in url and not url.endswith("profiles/"):
            try:
                iframes = driver.find_elements_by_xpath("//div[@class='lightbox guide_app']/iframe")
                links = driver.find_elements_by_class_name("app_links")
                for idx, link in enumerate(links):
                    frame = iframes[idx]
                    link.click()
                    driver.switch_to_frame(driver.find_element_by_id(frame.get_attribute("id")))
                    element = WebDriverWait(driver, 10).until(
                        EC.element_to_be_clickable((By.ID, "key"))
                    )
                    driver.switch_to_default_content()

            except Exception, exception:
                print "Moving on after 10 second wait.", str(exception)
        elif "/apps/builder" in url:
            frame = driver.find_element_by_xpath("//div[@class='lightbox']/iframe")
            driver.switch_to_frame(driver.find_element_by_id(frame.get_attribute("id")))
            try:
                element = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "key"))
                )
            except Exception, exception:
                print "Moving on after 10 second wait.", str(exception)
            driver.switch_to_default_content()


if __name__ == "__main__":
    main()