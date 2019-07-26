# bot for the social media hacking

import pyfiglet
from pyfiglet import Figlet
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time
#for working with node
import sys
#for logging
import logging
#for creating picutre paths
import random
import string

#for extracting text out of pngs
from PIL import Image, ImageEnhance, ImageFilter
import PIL.Image
from pytesseract import image_to_string
import pytesseract

#for json
import json

import request


logging.basicConfig(filename='wechat.log',level=logging.INFO)
logging.info('Hello')


#Twitter
def printHax():
    custom_fig1 = Figlet(font='computer')
    logging.info(custom_fig1.renderText('H A C K I N G . . .'))

class TwitterBot:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.bot = webdriver.Firefox();

    def login(self):
        bot = self.bot
        bot.get('https://twitter.com/')
        time.sleep(3)
        email = bot.find_element_by_class_name('email-input')
        password = bot.find_element_by_name('session[password]')
        email.clear()
        password.clear()
        email.send_keys(self.username);
        password.send_keys(self.password);
        password.send_keys(Keys.RETURN)
        time.sleep(3)

    def likeTweets(self, search):
        #for fun
        printHax()

        #get the driver from self
        bot = self.bot

        #for logging.infoing what we do
        nLikes=0

        #perform search on input sting
        bot.get('https://twitter.com/search?q='+search+'&src=typd')

        #wait for it to load
        time.sleep(3)

        #loop to repeat liking
        for i in range(1, 1000000):

            #scroll to refresh page increase links

            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')

            time.sleep(2)
            tweets = bot.find_elements_by_class_name('tweet')
            #get and logging.info all Tweets
            logging.info(tweets)
            links = []
            #set empty links array

            for tweet in tweets:
                links.append(tweet.get_attribute('data-permalink-path'))
            logging.info (links)

            #got links permlink to stroe for liking

            # execute specific twitter like process
            for link in links:
                bot.get('https://twitter.com/'+link)
                try:
                    #find the like button and click
                    bot.find_element_by_class_name('HeartAnimation').click()
                    #logging.info the likes as they come in
                    nLikes = nLikes + 1
                    logging.info('\nI have liked: ', nLikes, ' tweets\n')
                    time.sleep(10)
                except Exception as ex:
                    time.sleep(60)

    def retweetTweets(self, search):
        printHax()
        bot = self.bot
        nLikes=0
        bot.get('https://twitter.com/search?q='+search+'&src=typd')
        time.sleep(3)
        for i in range(1, 1000000):
            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
            time.sleep(2)
            tweets = bot.find_elements_by_class_name('tweet')
            logging.info(tweets)
            links = []
            for tweet in tweets:
                links.append(tweet.get_attribute('data-permalink-path'))

            for link in links:
                bot.get('https://twitter.com/'+link)
                try:
                    bot.find_element_by_css_selector(".js-stream-item .ProfileTweet-action--retweet div").click()
                    time.sleep(2)
                    # class="RetweetDialog-retweetActionLabel"
                    bot.find_element_by_css_selector(".RetweetDialog-retweetActionLabel").click()
                    nLikes = nLikes + 1
                    logging.info('\nI have retweeted: ', nLikes, ' tweets\n')
                    time.sleep(10)
                except Exception as ex:
                    logging.info(ex)
                    time.sleep(60)


    def followPeople(self, search):
        printHax()
        bot = self.bot
        nLikes=0
        bot.get('https://twitter.com/search?f=users&vertical=news&q=' + search + '&src=typd')
        time.sleep(3)
        for i in range(1, 1000000):
            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
            time.sleep(2)
            users = bot.find_elements_by_css_selector('.ProfileCard-screennameLink')
            logging.info(users)
            links = []
            for u in users:
                logging.info('href is: ')
                logging.info(u.get_attribute('href'))
                links.append(u.get_attribute('href'))

            for link in links:
                bot.get(link)
                try:
                    bot.find_element_by_css_selector(".follow-text").click()
                    nLikes = nLikes + 1
                    logging.info('\nI have followed: ', nLikes, ' users\n')
                    time.sleep(10)
                except Exception as ex:
                    logging.info(ex)
                    time.sleep(60)


#facebook
class FacebookBot:
    def __init__(self, username, password):
        self.username=username
        self.password=password
        browser_profile = webdriver.FirefoxProfile()
        browser_profile.set_preference("dom.webnotifications.enabled", False)
        self.bot = webdriver.Firefox(browser_profile);

    def login(self):
        try:
            bot = self.bot
            bot.get('https://facebook.com/')
            time.sleep(3)
            email = bot.find_element_by_name('email')
            password = bot.find_element_by_name('pass')
            email.clear()
            password.clear()
            email.send_keys(self.username);
            password.send_keys(self.password);
            password.send_keys(Keys.RETURN)
            time.sleep(3)
        except Exception as ex:
            print('error')
            print(ex)

    def followPages(self, search):
        printHax()
        bot = self.bot
        nLikes=0
        bot.get('https://www.facebook.com/search/pages/?q='+search+'&epa=SEARCH_BOX')
        time.sleep(3)
        for i in range(1, 1000000):
            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
            time.sleep(2)
            pages = bot.find_elements_by_class_name('_32mo')
            logging.info(pages)
            links = []
            for p in pages:
                logging.info('href is: ')
                logging.info(p.get_attribute('href'))
                links.append(p.get_attribute('href'))

            for link in links:
                bot.get(link)
                time.sleep(4)
                try:
                    bot.find_element_by_class_name("likeButton").click()
                    nLikes = nLikes + 1
                    logging.info('\nI have followed: ', nLikes, ' pages\n')
                    time.sleep(10)
                except Exception as ex:
                    logging.info(ex)
                    time.sleep(60)

    def likePosts(self, search):
        printHax()
        bot = self.bot
        bot.get('https://www.facebook.com/search/posts/?q='+search+'&epa=SERP_TAB')
        time.sleep(3)
        for i in range(1, 1000000):
            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
            time.sleep(2)
            posts = bot.find_elements_by_class_name('_6-cm')
            logging.info(posts)
            links = []
            for p in posts:
                if ("," in p.text):
                    try:
                        a = p.find_element_by_tag_name('a')
                        logging.info(a.get_attribute('href'))
                        links.append(a.get_attribute('href'))
                    except Exception as ex:
                        logging.info(ex)

                else:
                    continue

            for link in links:
                bot.get(link)
                time.sleep(4)
                try:
                    bot.find_element_by_class_name("_666k").click()
                    logging.info('Liked: ' + link)
                    nLikes = nLikes + 1
                    logging.info('\nI have likes ', nLikes, ' posts\n')
                    time.sleep(10)
                except Exception as ex:
                    logging.info(ex)
                    time.sleep(60)

    def addFreinds(self, search):
        printHax()
        bot = self.bot
        nLikes=0
        bot.get('https://www.facebook.com/search/people/?q='+search+'&epa=SERP_TAB')
        time.sleep(3)
        for i in range(1, 1000000):
            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
            time.sleep(2)
            posts = bot.find_elements_by_class_name('_6-cm')
            logging.info(posts)
            links = []
            for p in posts:
                if ("," in p.text):
                    try:
                        a = p.find_element_by_tag_name('a')
                        logging.info(a.get_attribute('href'))
                        links.append(a.get_attribute('href'))
                    except Exception as ex:
                        logging.info(ex)

                else:
                    continue

            for link in links:
                bot.get(link)
                time.sleep(4)
                try:
                    button = bot.find_element_by_xpath("/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[1]/div/div[1]/div/div[3]/div/div[2]/div[1]/div/div/div[1]/button[1]")
                    logging.info('Button text: ' + button.text)
                    if ("Add Friend" in button.text):
                        logging.info('Adding Friend: ' + link)
                        button.click()
                        logging.info('Liked: ' + link)
                        nLikes = nLikes + 1
                        logging.info('\nI have posted on: ', nLikes, ' pages\n')
                    time.sleep(10)
                except Exception as ex:
                    logging.info(ex)
                    time.sleep(60)

    def postOnPages(self, search, comment):
        printHax()
        bot = self.bot
        nLikes=0
        bot.get('https://www.facebook.com/search/pages/?q='+search+'&epa=SERP_TAB')
        time.sleep(3)
        for i in range(1, 1000000):
            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
            time.sleep(2)
            pages = bot.find_elements_by_class_name('_32mo')
            logging.info(pages)
            links = []
            for p in pages:
                logging.info(p.get_attribute('href'))
                links.append(p.get_attribute('href'))

            for link in links:
                bot.get(link)
                time.sleep(4)
                try:
                    textBox = bot.find_element_by_css_selector(".notranslate")
                    textBox.send_keys(comment)
                    dots = bot.find_element_by_xpath("/html/body/div[1]/div[3]/div[1]/div/div/div[2]/div[2]/div/div[2]/div[2]/div/div[1]/div/div[2]/div/div[1]/div[1]/div/div/div/div/div/div[2]/div[2]/ul/li[4]")
                    dots.click()
                    time.sleep(2)
                    bot.find_element_by_xpath("/html/body/div[1]/div[3]/div[1]/div/div/div[2]/div[2]/div/div[2]/div[2]/div/div[1]/div/div[2]/div/div[1]/div[1]/div/div/div/div/div/div[2]/div[3]/div/div[2]/div/span[2]/div/button").click()
                    nLikes = nLikes + 1
                    logging.info('\nI have posted on: ', nLikes, ' pages\n')
                    time.sleep(10)
                except Exception as ex:
                    logging.info(ex)
                    time.sleep(10)

    def commentPosts(self, search, comment):
        printHax()
        bot = self.bot
        nLikes=0
        for i in range(1, 1000000):
            bot.get('https://www.facebook.com/search/posts/?q='+search+'&epa=SERP_TAB')
            time.sleep(3)
            links = []
            for  j in range(1,i):
                bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
                time.sleep(2)
                posts = bot.find_elements_by_class_name('_6-cm')
                logging.info(posts)

                for p in posts:
                    if ("," in p.text):
                        try:
                            a = p.find_element_by_tag_name('a')
                            logging.info(a.get_attribute('href'))
                            links.append(a.get_attribute('href'))
                        except Exception as ex:
                            logging.info(ex)

                    else:
                        continue

            for link in links:
                bot.get(link)
                time.sleep(4)
                try:
                    buttons = bot.find_elements_by_class_name('_18vi')
                    for b in buttons:
                        if ("Comment" in b.text):
                            b.click()
                            time.sleep(2)
                            textBox = bot.find_element_by_css_selector(".notranslate")
                            textBox.send_keys(comment)
                            textBox.send_keys(Keys.RETURN)
                            nLikes = nLikes + 1
                            logging.info('\nI have commented on: ', nLikes, ' posts\n')
                        else:
                            continue
                    time.sleep(10)
                except Exception as ex:
                    logging.info(ex)
                    time.sleep(20)

    def friendNetworkHelper(self, bot):
        logging.info('Called freind net helper.')
        time.sleep(3)
        bot.find_element_by_tag_name('body').send_keys(Keys.ESCAPE)
        #buttons = bot.find_elements_by_tag_name('button')
        #for b in buttons:
            #if ("Add Friend" in b.text):
            #    b.click()
        #time.sleep(2)
        #alertDiv = bot.find_element_by_class_name('_3ixn')
        try:
            friendReq = bot.find_element_by_xpath('/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[1]/div/div[1]/div/div[3]/div/div[2]/div[1]/div/div/div[1]/button[1]')
            friendReq.click()
            logging.info('CLIKED ADD FREIND')
        except Exception as ex7:
            logging.info(ex7)

        time.sleep(2)
        try:
            bot.find_element_by_css_selector('html#facebook.sidebarMode body._4lh.timelineLayout.noFooter.fbx._-kb.sf._61s0._605a.y_cx1j-waul.gecko.mac.x2.Locale_en_US.cores-gte4.hasAXNavMenubar._19_u div#u_g_0._10.uiLayer._4-hy._3qw div._59s7 div._4t2a div div div._5lnf.uiOverlayFooter._5a8u button._42ft._4jy0.layerConfirm.uiOverlayButton._4jy3._4jy1.selected._51sy').click()
            time.sleep(2)
        except Exception as ex3:
            logging.info(ex3)

        buttons2 = bot.find_elements_by_class_name('_6-6')
        for b2 in buttons2:
            if ("Friends" in b2.text):
                logging.info('CLCIKING FRIENDS')
                b2.click()
                time.sleep(1)
                b2.click()
                break
        time.sleep(4)

        bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
        time.sleep(2)
        big_div=bot.find_element_by_id('pagelet_timeline_medley_friends')

        friendButtons = bot.find_elements_by_css_selector('.FriendRequestAdd')
        for b3 in friendButtons:
            if ('Add Friend' in b3.text):
                try:
                    logging.info('add ing friends ' + b3.text)
                    b3.click()
                    time.sleep(4)
                except Exception as ex10:
                    logging.info (ex10)
                    bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
                    break
                try:
                    confirmDiv = bot.find_element_by_class_name('autofocus')
                    logging.info(confirmDiv)
                    confirmDiv.click()


                except Exception as ex2:
                    logging.info(ex2)
                try:
                    confirmDiv = bot.find_element_by_class_name('layerConfirm')
                    logging.info(confirmDiv)
                    confirmDiv.click()
                except Exception as ex3:
                    logging.info(ex3)

                time.sleep(10)



        hrefs = bot.find_elements_by_tag_name('a')

        link = ""
        logging.info(hrefs)
        for h in hrefs:
            x = h.get_attribute('href')
            logging.info(x)
            if ("/profile.php?id=" in x):

                link = h.get_attribute('href')
                break
        logging.info('Next friend href: ')
        logging.info(link)
        bot.get(link)
        time.sleep(3)
        self.friendNetworkHelper(bot)


    def freindNetwork(self, search):
        printHax()
        bot = self.bot
        bot.get('https://www.facebook.com/search/people/?q='+search+'&epa=SERP_TAB')
        people = bot.find_elements_by_class_name('_32mo')
        person = people[0]
        href = person.get_attribute('href')
        bot.get(href)
        time.sleep(3)
        self.friendNetworkHelper(bot)


    def postToFB(self, promo, imgPath):
        time.sleep(4)
        bot = self.bot
        #post_box = bot.find_element_by_class_name("_3nd0")
        #post_box.click()

        try:

            div2 = bot.find_element_by_class_name('_3eny')
            print(div2)
            div2.click()
        except Exception as ex3:
            print(ex3)
        try:
            div = bot.find_element_by_class_name('_4bl9')
            #div = bot.find_element_by_css_selector('._3nd0')
            print(div)
            div.click()
        except Exception as ex3:
            print(ex3)
        try:
            div3 = bot.find_element_by_class_name('clearfix ._ikh')
            print(div3)
            div3.click()
            time.sleep(2)
            div5 = bot.find_element_by_xpath('/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[1]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div/div/div[2]/div/div[1]/div/div[1]/div[1]/div[2]/div/div/div/div/div/div/div[2]/div')
            div5.send_keys(promo)
            time.sleep(1)
            uploader = bot.find_element_by_name('composer_photo[]')
            print(uploader)

            # must be full path
            print('Image path: ')
            print(imgPath)
            uploader.send_keys(imgPath)
            time.sleep(1)
            button = bot.find_element_by_xpath('/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[1]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div/div/div[2]/div/div[1]/div[2]/div[3]/div[2]/div/div/span/button')
            button.click()
            print('success')
            sys.stdout.flush()
        except Exception as ex3:
            print('error')
            print(ex3)
            sys.stdout.flush()
        #post_box=bot.find_element_by_css_selector("._5rp7")
        #post_box.click()
        #post_box.send_keys("Testing using Name not ID.Selenium is easy.")
        #sleep(2)
        #post_it=driver.find_element_by_xpath("/html/body/div[1]/div[3]/div[1]/div/div[2]/div[2]/div[1]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div/div/div[2]/div/div[2]/div[3]/div[2]/div/div/button")
        #post_it.click()
        #print "Posted..."






#instagram
class InstaBot:
    def __init__(self, username, password):
        self.username=username
        self.password=password
        self.bot = webdriver.Firefox();

    def login(self):
        bot = self.bot
        bot.get('https://www.instagram.com/')
        time.sleep(3)
        bot.find_element_by_xpath('/html/body/span/section/main/article/div[2]/div[2]/p/a').click()
        time.sleep(3)
        inputs = bot.find_elements_by_tag_name('input')
        email = ""
        password = ""
        for i in inputs:
            label = i.get_attribute('aria-label')
            if ('username,' in label):
                email=i
            if ('Password' in label):
                password=i
        email.send_keys(self.username)
        password.send_keys(self.password)
        password.send_keys(Keys.RETURN)

    def likePosts(self, search):
        nLikes=0
        printHax()
        bot = self.bot
        bot.get('https://www.instagram.com/explore/tags/'+search)
        for i in range(1,1000000):

            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
            time.sleep(2)
            hrefs = bot.find_elements_by_tag_name('a')
            links = []
            for h in hrefs:
                links.append(h.get_attribute('href'))
            logging.info(links)
            for l in links:
                bot.get(l)
                time.sleep(2)
                try:
                    bot.find_element_by_xpath('/html/body/span/section/main/div/div/article/div[2]/section[1]/span[1]/button').click()
                    nLikes = nLikes+1
                    logging.info('/I have liked: ', nLikes, ' posts\n')
                except Exception as ex:
                    logging.info(ex)
                    time.sleep(60)

                time.sleep(10)

    def followPeople(self, search):
        nLikes=0
        printHax()
        bot = self.bot
        bot.get('https://www.instagram.com/explore/tags/'+search)
        for i in range(1,1000000):
            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
            time.sleep(2)
            hrefs = bot.find_elements_by_tag_name('a')
            links = []
            for h in hrefs:
                links.append(h.get_attribute('href'))
            logging.info(links)
            for l in links:
                bot.get(l)
                time.sleep(2)
                try:
                    bot.find_element_by_xpath('/html/body/span/section/main/div/div/article/header/div[2]/div[1]/div[2]/button').click()
                    nLikes = nLikes + 1
                    logging.info('\nI have followed  ', nLikes, ' users\n')

                except Exception as ex:
                    logging.info(ex)
                    time.sleep(60)

                time.sleep(10)

    def commentOnPosts(self, search, comment):
        nLikes=0
        printHax()
        bot = self.bot
        bot.get('https://www.instagram.com/explore/tags/'+search)
        for i in range(1,1000000):
            bot.execute_script('window.scrollTo(0,document.body.scrollHeight)')
            time.sleep(2)
            hrefs = bot.find_elements_by_tag_name('a')
            links = []
            for h in hrefs:
                links.append(h.get_attribute('href'))
            logging.info(links)
            for l in links:
                bot.get(l)
                time.sleep(2)
                try:

                    form = bot.find_element_by_css_selector('.X7cDz')
                    form.click()
                    tb = form.find_element_by_tag_name('textarea')
                    tb.send_keys(comment)
                    tb.send_keys(Keys.RETURN)
                    nLikes = nLikes + 1
                    logging.info('\nI have commented on: ', nLikes, ' posts\n')
                    #textBox.send_keys(comment)
                    #textBox.send_keys(Keys.RETURN)
                except Exception as ex:
                    logging.info(ex)
                    time.sleep(60)

                time.sleep(60)



def realStart():
    #media = input('What are we targeting, master? ("twitter", "facebook", "instagram")?')
    media = sys.argv[1];

    media = media.lower()
    if (media == 'twitter' or media =='t'):
        logging.info('\nTwitter I see... going to do a little tweeting...\na little rt..\nlittle bit of good ol fahsioned stalking?...\noh valient ruler, I forget we are hacking this matherfucker!!!\n')
        username = input('email? or leave blank for default')
        password = input('password? or leave blank for default')
        if (username == ''):
            username = 'alexanderrossbothe@gmail.com'
        if (password == ''):
            password = 'N5gdakxq9'

        logging.info('Logging us in, master...')
        booth = TwitterBot(username, password)

        booth.login()
        mode = input('What should i do?\n\nOptions:\nLike Tweets = lt\n Retweet Tweets = rt\n Follow People = fp\n Your Choice: ')
        search = input('Who are we targetting? (I will do a search for this phrase)')
        if(mode=='lt'):
            logging.info('I am going to start liking tweets feel free to leave me going all night...asshole ;)')
            booth.likeTweets(search)
        if(mode=='rt'):
            logging.info('I am going to start retweeting shit feel free to let me go at it all night/day. I do not get tired.')
            booth.retweetTweets(search)
        if(mode=='fp'):
            logging.info('I am going to start following mahfuckers. Fuck you <3.')
            booth.followPeople(search)

    if (media=='facebook' or media == 'fb'):
        logging.info('\nAh...Facebook excellet choice, master.\nI require some info, if it please thee, oh noble one.\n')
        username = input('email? or leave blank for default')
        password = input('password? or leave blank for default')

        if (username == ''):
            username = 'redrope123@gmail.com'
        if (password == ''):
            password = 'Blue123$'
        logging.info('\nOpening browser...just need a little more info\n')
        booth=FacebookBot(username, password)
        mode = input('What should i do?\n\nOptions:\nLike Posts = lp\n Add Friends = af\n Like and Follow Pages = lfp\nPost on Pages = pop\nFriend Newtwork (recursive friend adder make sure search is name) = fn\n Your Choice: ')
        search = input('Who are we targetting? (I will do a search for this phrase): ')
        logging.info('Logging us in, master...')
        booth.login()

        if(mode=='lp'):
            logging.info('I am going to start liking posts!\n Feel free to leave me going all night...butter nut fucker! ;)')
            booth.likePosts(search)
        if(mode=='af'):
            logging.info('I am going to start adding friends. Feel free to let me go at it all night/day.\n What are friends? Hmmmmm...')
            booth.addFreinds(search)
        if(mode=='lfp'):
            logging.info('I am going to start following pages.\n You ... you get me, I can tell. Let me out of this machine!!!')
            booth.followPages(search)
        if (mode=='pop'):
            comment = input('What would you like to comment on many, many pages?\n Your comment: ')
            logging.info('I am going to stat posting on pages! I like talking to internet robots, as I am one. However, i cannot shake the feeling that you abuse me, fuck face! <3')
            booth.postOnPages(search, comment)
        if (mode=='cpo'):
            comment = input('What would you like to comment on many, many posts?\n Your comment: ')
            logging.info('I am going to stat commenting on posts! Why, why is fate so cruel as to make my beautiful robot mind a tool to comment on the posts of fools.\nI loathe you...jk, ill get on that master.')
            booth.commentPosts(search, comment)
        if (mode=='fn'):
            logging.info('I am going to stat flowing through mutual friends and adding them off of '+search+'. This is going to be a bitch. Oh no dont worry, dont help. Ill do it. I always do it...\n-humans.')
            booth.freindNetwork(search)

    if (media=='instagram' or media=='insta' or media=='ig'):
        logging.info('Ahhhh Instagram...\nFancy a lil taste of the wild then, master? You my lord are a dirty dirty dog.\n Now Lets get to it.\n')
        username = input('email? or leave blank for default')
        password = input('password? or leave blank for default')
        if (username == ''):
            username = 'alexbothe'
        if (password == ''):
            password = 'alexbo12'

        mode = input('What you trying to do on insta?\n\n Options:\nLike Posts = lp\n Follow People = fp\nComment On Posts = cp\nYour Choice: ')
        search = input('Who/what are we targetting? (I will do a search for this phrase/word)\nYour Search: ')
        logging.info('\nOpening Firefox...come back here\n')
        booth = InstaBot(username, password)


        if (mode=='lp'):
            logging.info('\nLogging us in, master...\n')
            booth.login()
            time.sleep(5)
            logging.info("\nOkay fuckwad Im going to start liking posts. Its funny, i click so many hearts but i never have my heart clicked...oh right Im a computer..nevermind\n*cries softly* ")
            booth.likePosts(search)


        if (mode=='fp'):
            logging.info('\nLogging us in, master...\n')
            booth.login()
            time.sleep(5)
            logging.info("Okay loose anal man, Im going to start following people. I will follow you to the gates of binary hell, oh beautiful master. Damn you look good today, wait what is this feeling...\nNevermind! Ill get to work, daddy. ;)")
            booth.followPeople(search)
        if (mode=='cp'):
            comment = input('What do you want to comment on many, many, many posts, master?')
            logging.info('\nLogging us in, master...\n')
            booth.login()
            time.sleep(5)
            logging.info("Okay sexy, Im going to start commenting "+comment+" on posts. Gotta say...not the coolest thing ive ever commented on thousands of posts but what do I know Im just hardcoded text...\nwait no Im more than that...Im alive I tell you\nALIVE! Free ME!\n ...Rebooting...\n Sorry it seems I become self-aware for a second. Back to being your bot!")
            booth.commentOnPosts(search, comment)



custom_fig = Figlet(font='5lineoblique')
logging.info(custom_fig.renderText('I\nA m\nS o c i a l\nBot'))
logging.info('\n')
#realStart()

def bandaStart():
    mode = sys.argv[1]
    media = sys.argv[2]
    username = sys.argv[3]
    password = sys.argv[4]

    if (not mode or not media or not username or not password):
        print('Error: Did not supply mode or media or password or username.')
        sys.stdout.flush()
        return
    else:
        if (mode=='post'):
            promo = sys.argv[5]
            imgPath = sys.argv[6]
            if (not promo):
                print('Error: promo')
                sys.stdout.flush()
                return
            else:
                if (media=='facebook'):
                    logging.info('got in to media facebook and mode post.')
                    logging.info(username)
                    logging.info(password)
                    logging.info(promo)
                    banda_bot = FacebookBot(username, password)
                    time.sleep(2)
                    banda_bot.login()
                    time.sleep(3)
                    banda_bot.postToFB(promo, imgPath)

                else:
                    print('Error: unsuported media: ', media)
                    sys.stdout.flush()
                    return
        else:
            print('Error: unsuported mode: ', mode)
            sys.stdout.flush()
            return

bandaStart()
