!-- layouts/default.vue -->
<template>
    <div class="wrapper d-flex">
        <!-- Sidebar - Fixed on the left -->
        <nav id="sidebar" :class="{ active: isSidebarActive }">
            <div class="sidebar-header">
                <h3>Bootstrap Sidebar</h3>
                <strong>BS</strong>
            </div>

            <ul class="list-unstyled components">
                <li class="active">
                    <a href="#homeSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">
                        <i class="fas fa-home"></i>
                        Home
                    </a>
                    <ul class="collapse list-unstyled" id="homeSubmenu">
                        <li>
                            <a href="#">Home 1</a>
                        </li>
                        <li>
                            <a href="#">Home 2</a>
                        </li>
                        <li>
                            <a href="#">Home 3</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="#">
                        <i class="fas fa-briefcase"></i>
                        About
                    </a>
                    <a href="#pageSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">
                        <i class="fas fa-copy"></i>
                        Pages
                    </a>
                    <ul class="collapse list-unstyled" id="pageSubmenu">
                        <li>
                            <a href="#">Page 1</a>
                        </li>
                        <li>
                            <a href="#">Page 2</a>
                        </li>
                        <li>
                            <a href="#">Page 3</a>
                        </li>
                    </ul>
                </li>
            </ul>
        </nav>

        <!-- Main content wrapper - Takes remaining width -->
        <div class="content-wrapper d-flex flex-column w-100">
            <!-- Your existing Navbar -->
            <Navbar expand="lg" background-color="body-tertiary">
                <Container type="fluid">
                    <NavbarBrand>Elemental Heroes
                    </NavbarBrand>
                    <NavbarToggler />
                    <button id="sidebarCollapse" @click="toggleSidebar">Toggle Sidebar</button>

                    <NavbarCollapse>
                        <NavbarNavList margin="e-auto b-2 b-lg-0">
                            <NavItem>
                                <NavLink active>
                                    Home
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink to="">
                                    Profile
                                </NavLink>
                            </NavItem>
                            <NavItemDropdown>
                                <NavItemDropdownToggle>Dropdown</NavItemDropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem>Action</DropdownItem>
                                    <DropdownItem to="/lang-en/components/navbar/">
                                        Another action
                                    </DropdownItem>
                                    <DropdownItemDivider />
                                    <DropdownItem>Something else here</DropdownItem>
                                </DropdownMenu>
                            </NavItemDropdown>
                            <NavItem>
                                <NavLink disabled>
                                    Disabled
                                </NavLink>
                            </NavItem>
                        </NavbarNavList>
                        <BForm flex role="search">
                            <BFormInput margin="e-2" type="search" placeholder="Search" />
                            <b-button color="outline-success" type="submit">
                                Search
                            </b-button>
                        </BForm>
                    </NavbarCollapse>
                </Container>
            </Navbar>

            <!-- Main content area -->
            <main class="container-fluid py-4">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const isSidebarActive = ref(false);

function toggleSidebar() {
    isSidebarActive.value = !isSidebarActive.value;
}
</script>

<style scoped>
/* Basic structure styling */
.wrapper {
    min-height: 100vh;
}

/* Sidebar styling */
#sidebar {
    min-width: 250px;
    max-width: 250px;
    min-height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    transition: all 0.3s;
    background: #7386D5;
    color: #fff;
}

/* Content wrapper styling */
.content-wrapper {
    margin-left: 250px;
    transition: all 0.3s;
}

#sidebar.active+.content-wrapper {
    margin-left: 80px;
}

/* Your existing sidebar styles */
#sidebar.active {
    min-width: 80px;
    max-width: 80px;
    text-align: center;
}

#sidebar .sidebar-header strong {
    display: none;
}

#sidebar.active .sidebar-header h3 {
    display: none;
}

#sidebar.active .sidebar-header strong {
    display: block;
}

#sidebar ul li a {
    text-align: left;
}

#sidebar.active ul li a {
    padding: 20px 10px;
    text-align: center;
    font-size: 0.85em;
}

#sidebar.active ul li a i {
    margin-right: 0;
    display: block;
    font-size: 1.8em;
    margin-bottom: 5px;
}

#sidebar.active ul ul a {
    padding: 10px !important;
}

#sidebar.active .dropdown-toggle::after {
    top: auto;
    bottom: 10px;
    right: 50%;
    -webkit-transform: translateX(50%);
    -ms-transform: translateX(50%);
    transform: translateX(50%);
}

/* Your existing navbar styles */
.navbar {
    position: sticky;
    top: 0;
    z-index: 999;
}

main {
    min-height: calc(100vh - 70px);
}

/* Your existing media queries */
@media (max-width: 768px) {
    #sidebar {
        margin-left: -250px;
    }

    #sidebar.active {
        margin-left: 0;
        min-width: 80px;
        max-width: 80px;
    }

    .content-wrapper {
        margin-left: 0;
    }

    #sidebar.active+.content-wrapper {
        margin-left: 80px;
    }

    #sidebar .sidebar-header strong {
        display: none;
    }

    #sidebar.active .sidebar-header h3 {
        display: none;
    }

    #sidebar.active .sidebar-header strong {
        display: block;
    }

    #sidebar.active ul li a {
        padding: 20px 10px;
        font-size: 0.85em;
    }

    #sidebar.active ul li a i {
        margin-right: 0;
        display: block;
        font-size: 1.8em;
        margin-bottom: 5px;
    }

    #sidebar.active ul ul a {
        padding: 10px !important;
    }

    .dropdown-toggle::after {
        top: auto;
        bottom: 10px;
        right: 50%;
        -webkit-transform: translateX(50%);
        -ms-transform: translateX(50%);
        transform: translateX(50%);
    }
}
</style>