from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, OrganizationProfile, VolunteerProfile, AuditLog
from donations.models import FoodDonation, DonationRequest
from pickups.models import Pickup
from notifications.models import Notification

class Command(BaseCommand):
    help = 'Seeds database with realistic donors, NGOs, volunteers, donations, and workflow items'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing existing data...")
        Notification.objects.all().delete()
        Pickup.objects.all().delete()
        DonationRequest.objects.all().delete()
        FoodDonation.objects.all().delete()
        AuditLog.objects.all().delete()
        OrganizationProfile.objects.all().delete()
        VolunteerProfile.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("Creating demo users...")

        # 1. Admin
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@foodbridge.org',
            password='admin123',
            role='ADMIN',
            phone='+1 555-0199',
            city='Metro City'
        )

        # 2. Donors
        donor_hotel = User.objects.create_user(
            username='grand_palace_hotel',
            email='contact@grandpalace.com',
            password='password123',
            role='DONOR',
            phone='+1 555-1001',
            address='100 Grand Boulevard, Downtown',
            city='Metro City',
            pincode='560001'
        )
        donor_hotel.first_name = "Grand Palace"
        donor_hotel.last_name = "Hotel & Banquets"
        donor_hotel.save()

        donor_bakery = User.objects.create_user(
            username='fresh_daily_bakery',
            email='hello@freshdailybakery.com',
            password='password123',
            role='DONOR',
            phone='+1 555-1002',
            address='42 Bakery Lane, Westside',
            city='Metro City',
            pincode='560012'
        )
        donor_bakery.first_name = "Fresh Daily"
        donor_bakery.last_name = "Artisan Bakery"
        donor_bakery.save()

        donor_market = User.objects.create_user(
            username='green_valley_supermarket',
            email='support@greenvalley.com',
            password='password123',
            role='DONOR',
            phone='+1 555-1003',
            address='88 Central Market Arcade',
            city='Metro City',
            pincode='560025'
        )
        donor_market.first_name = "Green Valley"
        donor_market.last_name = "Supermarket"
        donor_market.save()

        # 3. NGOs
        ngo_hope = User.objects.create_user(
            username='hope_food_bank',
            email='director@hopefoodbank.org',
            password='password123',
            role='NGO',
            phone='+1 555-2001',
            address='12 Harmony Street, East District',
            city='Metro City',
            pincode='560034'
        )
        ngo_hope.first_name = "Hope Community"
        ngo_hope.last_name = "Food Bank"
        ngo_hope.save()
        OrganizationProfile.objects.create(
            user=ngo_hope,
            organisation_name="Hope Community Food Bank",
            reg_number="NGO-FB-2024-899",
            contact_person="Sarah Jenkins",
            address="12 Harmony Street, East District",
            city="Metro City",
            pincode="560034",
            verification_status="approved"
        )

        ngo_shelter = User.objects.create_user(
            username='shelter_care_foundation',
            email='help@sheltercare.org',
            password='password123',
            role='NGO',
            phone='+1 555-2002',
            address='74 Compassion Way, North Hills',
            city='Metro City',
            pincode='560048'
        )
        ngo_shelter.first_name = "Shelter Care"
        ngo_shelter.last_name = "Outreach"
        ngo_shelter.save()
        OrganizationProfile.objects.create(
            user=ngo_shelter,
            organisation_name="Shelter Care Outreach Foundation",
            reg_number="NGO-SCO-2023-112",
            contact_person="David Miller",
            address="74 Compassion Way, North Hills",
            city="Metro City",
            pincode="560048",
            verification_status="approved"
        )

        # 4. Volunteers
        vol_alex = User.objects.create_user(
            username='alex_rider',
            email='alex@rescuefood.net',
            password='password123',
            role='VOLUNTEER',
            phone='+1 555-3001',
            address='25 Sunset Blvd',
            city='Metro City',
            pincode='560001'
        )
        vol_alex.first_name = "Alex"
        vol_alex.last_name = "Rider"
        vol_alex.save()
        VolunteerProfile.objects.create(
            user=vol_alex,
            vehicle_type="Van / Car",
            availability="Available Daily 2PM - 10PM",
            service_area="Downtown & East District",
            deliveries_completed=14
        )

        vol_priya = User.objects.create_user(
            username='priya_sharma',
            email='priya@volunteers.org',
            password='password123',
            role='VOLUNTEER',
            phone='+1 555-3002',
            address='18 Garden Court',
            city='Metro City',
            pincode='560012'
        )
        vol_priya.first_name = "Priya"
        vol_priya.last_name = "Sharma"
        vol_priya.save()
        VolunteerProfile.objects.create(
            user=vol_priya,
            vehicle_type="Scooter / Bike",
            availability="Available Weekends & Evenings",
            service_area="Westside & North Hills",
            deliveries_completed=8
        )

        self.stdout.write("Creating food donations...")

        now = timezone.now()

        # Donation 1: 50 Meal Servings from Hotel
        d1 = FoodDonation.objects.create(
            donor=donor_hotel,
            title="50 Gourmet Dinner Buffet Servings (Rice, Paneer Curry & Naan)",
            description="Prepared for a corporate conference. Untouched, hygienically packaged in thermal containers, ready for pickup. High protein vegetarian meal.",
            category="Cooked Meals",
            quantity=50,
            reserved_quantity=20, # 20 approved for Hope Food Bank, 30 still available!
            unit="servings",
            estimated_servings=50,
            prepared_at=now - timedelta(hours=2),
            pickup_deadline=now + timedelta(hours=5),
            pickup_location="Grand Palace Hotel - Kitchen Dispatch Dock B, 100 Grand Boulevard",
            city="Metro City",
            pincode="560001",
            storage_instructions="Store in warm holding containers or consume within 4 hours.",
            allergen_information="Contains Dairy (paneer, butter) and Gluten (naan). Nut free.",
            image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
            status="AVAILABLE"
        )

        # Donation 2: 70 Fresh Artisan Breads & Croissants from Bakery
        d2 = FoodDonation.objects.create(
            donor=donor_bakery,
            title="70 Fresh Artisan Sourdough Breads & French Croissants",
            description="Freshly baked this morning at Fresh Daily Bakery. Packed in clean paper bakery crates, crisp and delicious.",
            category="Bakery & Bread",
            quantity=70,
            reserved_quantity=0,
            unit="items",
            estimated_servings=70,
            prepared_at=now - timedelta(hours=4),
            pickup_deadline=now + timedelta(hours=14),
            pickup_location="Fresh Daily Bakery - Front Counter, 42 Bakery Lane",
            city="Metro City",
            pincode="560012",
            storage_instructions="Keep in dry, cool conditions.",
            allergen_information="Contains Wheat, Gluten, Milk, Butter.",
            image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
            status="AVAILABLE"
        )

        # Donation 3: 40 kg Fresh Farm Produce from Supermarket
        d3 = FoodDonation.objects.create(
            donor=donor_market,
            title="40 kg Crisp Organic Apples, Carrots & Greens",
            description="Fresh surplus farm produce from weekly inventory rotation. Premium grade, crisp and packed in wooden crates.",
            category="Fresh Produce",
            quantity=40,
            reserved_quantity=0,
            unit="kg",
            estimated_servings=120,
            prepared_at=now - timedelta(hours=6),
            pickup_deadline=now + timedelta(days=2),
            pickup_location="Green Valley Supermarket - Loading Dock 1, 88 Central Market Arcade",
            city="Metro City",
            pincode="560025",
            storage_instructions="Store in cold room or shaded produce crates.",
            allergen_information="None.",
            image_url="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
            status="AVAILABLE"
        )

        # Donation 4: 35 Portions Packaged Sandwich Boxes
        d4 = FoodDonation.objects.create(
            donor=donor_hotel,
            title="35 Packaged Club Sandwich & Fruit Packs",
            description="Individual sealed meal packs with club sandwiches, whole apples, and juice boxes.",
            category="Packaged Foods",
            quantity=35,
            reserved_quantity=35,
            unit="boxes",
            estimated_servings=35,
            prepared_at=now - timedelta(hours=8),
            pickup_deadline=now + timedelta(hours=8),
            pickup_location="Grand Palace Hotel - Catering Desk, 100 Grand Boulevard",
            city="Metro City",
            pincode="560001",
            storage_instructions="Refrigerate until serving.",
            allergen_information="Egg, Wheat, Soy.",
            image_url="https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
            status="RESERVED"
        )

        # Donation 5: Past Completed Donation (for analytics demonstration)
        d5 = FoodDonation.objects.create(
            donor=donor_market,
            title="60 Liters Pasteurized Whole Milk & Yogurt Cups",
            description="Delivered to Shelter Care Outreach yesterday. 100% rescued.",
            category="Dairy & Eggs",
            quantity=60,
            reserved_quantity=60,
            unit="liters",
            estimated_servings=180,
            prepared_at=now - timedelta(days=1),
            pickup_deadline=now - timedelta(hours=6),
            pickup_location="Green Valley Supermarket Dock 2",
            city="Metro City",
            pincode="560025",
            status="COMPLETED"
        )

        self.stdout.write("Creating donation requests and pickup workflows...")

        # Request A: NGO Hope requested 20 servings of d1 (Approved -> Pickup in progress!)
        req_a = DonationRequest.objects.create(
            donation=d1,
            receiver=ngo_hope,
            requested_quantity=20,
            notes="For our evening community dinner program at East Community Center.",
            status="APPROVED",
            reviewed_at=now - timedelta(minutes=30)
        )
        pickup_a = Pickup.objects.create(
            donation_request=req_a,
            volunteer=vol_alex,
            status="ASSIGNED",
            otp_code="482915",
            otp_expires_at=now + timedelta(hours=6)
        )

        # Request B: NGO Shelter Care requested 15 kg from Produce d3 (Pending donor approval!)
        req_b = DonationRequest.objects.create(
            donation=d3,
            receiver=ngo_shelter,
            requested_quantity=15,
            notes="We will prepare nutritious soups and fresh meals for 45 shelter residents.",
            status="PENDING"
        )

        # Request C: NGO Shelter Care received d4 (Delivered & confirmed!)
        req_c = DonationRequest.objects.create(
            donation=d4,
            receiver=ngo_shelter,
            requested_quantity=35,
            notes="For emergency night shelter guests.",
            status="COMPLETED",
            reviewed_at=now - timedelta(hours=5)
        )
        pickup_c = Pickup.objects.create(
            donation_request=req_c,
            volunteer=vol_priya,
            status="DELIVERED",
            otp_code="739104",
            pickup_time=now - timedelta(hours=3),
            delivery_time=now - timedelta(hours=1)
        )

        # Request D: Past Completed (for historical stats)
        req_d = DonationRequest.objects.create(
            donation=d5,
            receiver=ngo_hope,
            requested_quantity=60,
            status="COMPLETED",
            reviewed_at=now - timedelta(days=1)
        )
        pickup_d = Pickup.objects.create(
            donation_request=req_d,
            volunteer=vol_alex,
            status="DELIVERED",
            otp_code="918234",
            pickup_time=now - timedelta(days=1, hours=4),
            delivery_time=now - timedelta(days=1, hours=2)
        )

        self.stdout.write("Creating sample notifications...")

        Notification.objects.create(
            user=donor_hotel,
            title="Volunteer Assigned for Pickup",
            message=f"Volunteer Alex Rider has accepted pickup for '50 Gourmet Dinner Buffet Servings'. Share your Pickup OTP {pickup_a.otp_code} when they arrive.",
            notification_type="info"
        )

        Notification.objects.create(
            user=donor_market,
            title="New Food Request from Shelter Care",
            message="Shelter Care Outreach Foundation has requested 15 kg of '40 kg Crisp Organic Apples, Carrots & Greens'.",
            notification_type="request"
        )

        Notification.objects.create(
            user=ngo_hope,
            title="Request Approved!",
            message="Grand Palace Hotel approved your request for 20 servings. Volunteer Alex Rider is on the way.",
            notification_type="success"
        )

        Notification.objects.create(
            user=vol_alex,
            title="New Pickup Scheduled",
            message=f"Pickup assigned at Grand Palace Hotel - Kitchen Dispatch Dock B. Pickup OTP verification required upon food collection.",
            notification_type="info"
        )

        self.stdout.write(self.style.SUCCESS("Database successfully seeded with realistic FoodBridge data!"))
