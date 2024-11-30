
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { BadgeCheck, Building, Coins, Lock } from 'lucide-react'
import { ArrowRight } from 'lucide-react';
import avatar1 from "@/src/components/02.png"
import avatar2 from "@/src/components/04.png"
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen relative">

      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]"></div></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8" />
        <div className="pt-8 px-5 md:px-0">
          <div className="relative mx-auto flex max-w-2xl flex-col items-center">
            <div className="mb-8 flex">

              <span className="relative inline-block overflow-hidden rounded-full p-[1px]">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#a9a9a9_0%,#0c0c0c_50%,#a9a9a9_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#171717_0%,#737373_50%,#171717_100%)]" />
                <div className="inline-flex h-full w-full justify-center rounded-full bg-white px-3 py-1 text-xs font-medium leading-5 text-slate-600 backdrop-blur-xl dark:bg-black dark:text-slate-200">
                  New NFTs ⚡️
                  <span className="inline-flex items-center pl-2 text-black dark:text-white">
                    Get Now{' '}
                    <ArrowRight
                      className="pl-0.5 text-black dark:text-white"
                      size={16}
                    />
                  </span>
                </div>
              </span>

            </div>
            <h2 className="text-center text-3xl font-medium text-gray-900 dark:text-gray-50 sm:text-6xl">
              Revolutionizing Real Estate {' '}
              <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-slate-500 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">
                with NFTs
              </span>
            </h2>
            <p className="mt-6 text-center text-lg leading-6 text-gray-600 dark:text-gray-200">
              Unlock exclusive property investments with NFTs. Buy, sell, and trade real estate securely on the blockchain, revolutionizing the way you own and invest
            </p>
            <div className="mt-10 flex gap-4">
              <a
                href="/marketplace"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Button>
                  Marketplace <ArrowRight className="pl-0.5" size={16} />
                </Button>{' '}
              </a>
              <a
                href="/onsale"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="secondary">
                  BUY NOW
                </Button>
              </a>
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 py-16">

          <section className="mt-24">
            <h3 className="text-3xl font-semibold text-black mb-8">Featured Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  id: "1",
                  name: "Luxury Villa in Sector 9, Chandigarh",
                  address: "123, Sector 9, Chandigarh, India",
                  description:
                    "A luxurious 5-bedroom villa located in one of Chandigarh's most prestigious neighborhoods. Features modern architecture and a beautifully landscaped garden.",
                  image:
                    "https://content.jdmagicbox.com/comp/chandigarh/b2/0172px172.x172.220404161836.u5b2/catalogue/elite-interio-mohali-sector-82-mohali-wall-paper-dealers-v837bd8u92.jpg",
                },
                {
                  id: "10",
                  name: "High-rise Apartment in Sector 34, Chandigarh",
                  address: "Apartment 1103, Tower A, Sector 34, Chandigarh, India",
                  description:
                    "A newly built high-rise apartment offering city views and modern amenities, located in a fast-developing area.",
                  image:
                    "https://www.omaxe.com/projectgallery/gallery_1670580612138.jpg",
                },
                {
                  id: "2",
                  name: "Modern Apartment in Sector 17, Chandigarh",
                  address: "789, Sector 17, Chandigarh, India",
                  description:
                    "A contemporary apartment in the heart of Chandigarh's business district, featuring high-end finishes and city views.",
                  image:
                    "https://images.adsttc.com/media/images/637c/cc4e/db20/0f35/7400/b765/newsletter/housing-apartment-at-badade-nagar-studio-frozen-music_1.jpg?1669123187",
                },
              ].map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg"
                >
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="text-xl font-semibold mb-2 text-black">{property.name}</h4>
                    <p className="text-gray-600 mb-4">{property.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>


          <section className="mt-24">
            <h3 className="text-3xl font-semibold text-black mb-8 text-center">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Browse Properties", icon: Building, description: "Explore our curated collection of digital real estate NFTs" },
                { title: "Purchase NFT", icon: Coins, description: "Use cryptocurrency to securely purchase your chosen property" },
                { title: "Own Digital Real Estate", icon: BadgeCheck, description: "Receive ownership rights recorded on the blockchain" }
              ].map((step, index) => (
                <Card key={index} className=" bg-slate-200 border-none text-zinc-600 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4">
                      <step.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-24">
            <h3 className="text-3xl font-semibold text-black mb-8 text-center">Benefits of NFT Real Estate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Fractional Ownership", description: "Invest in high-value properties with lower capital requirements" },
                { title: "Liquidity", description: "Easily trade your real estate assets on NFT marketplaces" },
                { title: "Transparency", description: "All transactions and ownership records are publicly verifiable on the blockchain" },
                { title: "Global Access", description: "Invest in international properties without geographical restrictions" }
              ].map((benefit, index) => (
                <Card key={index} className=" bg-slate-200 border-none text-zinc-600 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-24">
            <h3 className="text-3xl font-semibold text-black mb-8 text-center">What Our Investors Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: "John Doe", title: "Tech Entrepreneur", quote: "EstateX has revolutionized my investment portfolio. The ease of buying and selling digital properties is unmatched.", img: avatar1 },
                { name: "Jane Smith", title: "Real Estate Investor", quote: "I've been in traditional real estate for years, but this platform opens up exciting new opportunities in the digital space.", img: avatar2 }
              ].map((testimonial, index) => (
                <Card key={index} className="bg-white text-gray-800">
                  <CardContent className="pt-6">
                    <p className="italic mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full mr-4">
                        <Image
                          src={testimonial.img}
                          height={48}
                          width={48}
                          alt='avatar'
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-24 text-center">
            <h3 className="text-3xl font-semibold text-black mb-6">Ready to Start Your Digital Real Estate Journey?</h3>
            <p className="text-xl text-zinc-400 mb-8">Join thousands of investors already benefiting from NFT real estate</p>
            <a
              href="/marketplace"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Get Started Now
              </Button>
            </a>
          </section>
        </main>

        <footer className="bg-gray-800/80 backdrop-blur-sm text-white py-12 mt-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-between flex-col gap-5 md:px-10 md:flex-row">
              <div>
                <h4 className="text-lg font-semibold mb-4">EstateX</h4>
                <p className="text-sm text-gray-400">Revolutionizing real estate investment through blockchain technology</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
                <p className="text-sm text-gray-400 mb-2">Stay updated with our latest offerings</p>
                <div className="flex">
                  <input type="email" placeholder="Your email" className="px-3 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-600" />
                  <Button className="rounded-l-none">Subscribe</Button>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-center">
              <p>&copy; 2024 EstateX. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}